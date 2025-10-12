// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const publicRoutes = ["/auth/register", "/auth/login"];
const superAdminRoutes = ["/super-admin"];
const userRoutes = ["/home"];

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://ecommerce-fashion-03io.onrender.com";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware entirely for public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Get token from cookies
  let accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  console.log("=== MIDDLEWARE DEBUG ===");
  console.log("Pathname:", pathname);
  console.log("AccessToken:", accessToken ? "exists" : "missing");
  console.log("RefreshToken:", refreshToken ? "exists" : "missing");

  // If no access token, redirect to login immediately
  if (!accessToken) {
    console.log("No access token, redirecting to login");
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  try {
    // Verify the access token
    const { payload } = await jwtVerify(
      accessToken,
      new TextEncoder().encode(process.env.JWT_SECRET!)
    );
    const { role } = payload as { role: string };
    console.log("Token verified, role:", role);

    // Role-based route protection
    if (
      role === "SUPER_ADMIN" &&
      userRoutes.some((route) => pathname.startsWith(route))
    ) {
      return NextResponse.redirect(new URL("/super-admin", request.url));
    }

    if (
      role !== "SUPER_ADMIN" &&
      superAdminRoutes.some((route) => pathname.startsWith(route))
    ) {
      return NextResponse.redirect(new URL("/home", request.url));
    }

    return NextResponse.next();
  } catch (err) {
    console.error("Token verification failed:", err);

    // CRITICAL FIX: Only try to refresh if we have a refresh token
    // AND we're not in a refresh loop
    if (refreshToken && !pathname.includes("/auth")) {
      try {
        console.log("Attempting token refresh...");
        const refreshResponse = await fetch(
          `${BACKEND_URL}/api/auth/refresh-token`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Cookie: `refreshToken=${refreshToken}`,
            },
          }
        );

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          
          if (data.success && data.accessToken) {
            console.log("Token refreshed successfully");
            
            const response = NextResponse.next();
            response.cookies.set("accessToken", data.accessToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "strict",
              maxAge: 60 * 60, // 1 hour
              path: "/",
            });
            
            return response;
          }
        }
        
        console.log("Token refresh failed, redirecting to login");
      } catch (refreshErr) {
        console.error("Token refresh error:", refreshErr);
      }
    }

    // If refresh fails or no refresh token, clear cookies and redirect
    const response = NextResponse.redirect(new URL("/auth/login", request.url));
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    return response;
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|auth/login|auth/register).*)",
  ],
};
