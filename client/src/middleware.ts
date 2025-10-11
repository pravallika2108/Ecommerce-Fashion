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

  // Try to get token from cookies first
  let accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  console.log("=== MIDDLEWARE DEBUG ===");
  console.log("Pathname:", pathname);
  console.log("AccessToken from cookie:", accessToken ? "exists" : "undefined");
  console.log("RefreshToken from cookie:", refreshToken ? "exists" : "undefined");

  // If no cookie, try to get from request header (sent by frontend)
  if (!accessToken) {
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      accessToken = authHeader.substring(7);
      console.log("AccessToken from header:", accessToken ? "exists" : "undefined");
    }
  }

  if (accessToken) {
    try {
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
      
      // Try to refresh token
      if (refreshToken) {
        try {
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
            const newAccessToken = data.accessToken;
            console.log("Token refreshed successfully");

            const response = NextResponse.next();
            response.cookies.set("accessToken", newAccessToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              path: "/",
            });
            return response;
          }
        } catch (refreshErr) {
          console.error("Token refresh error:", refreshErr);
        }
      }

      // If refresh fails, redirect to login
      const resp = NextResponse.redirect(new URL("/auth/login", request.url));
      resp.cookies.delete("accessToken");
      resp.cookies.delete("refreshToken");
      return resp;
    }
  }

  // No access token at all — redirect to login
  console.log("No access token found, redirecting to login");
  return NextResponse.redirect(new URL("/auth/login", request.url));
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
