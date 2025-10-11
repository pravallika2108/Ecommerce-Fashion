// src/middleware.ts

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const publicRoutes = ["/auth/register", "/auth/login"];
const superAdminRoutes = ["/super-admin", "/super-admin/:path*"];
const userRoutes = ["/home"];

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://ecommerce-fashion-03io.onrender.com";

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const { pathname } = request.nextUrl;

  console.log("=== MIDDLEWARE DEBUG ===");
  console.log("Pathname:", pathname);
  console.log("AccessToken:", accessToken ? "exists" : "undefined");
  console.log("RefreshToken:", refreshToken ? "exists" : "undefined");

  if (accessToken) {
    try {
      const { payload } = await jwtVerify(
        accessToken,
        new TextEncoder().encode(process.env.JWT_SECRET!)
      );
      const { role } = payload as { role: string };

      // If user is already authenticated, avoid showing login/register
      if (publicRoutes.includes(pathname)) {
        const dest = role === "SUPER_ADMIN" ? "/super-admin" : "/home";
        return NextResponse.redirect(new URL(dest, request.url));
      }

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

      // Token might be expired or invalid → try refresh
      if (refreshToken) {
        try {
          const refreshResponse = await fetch(
            `${BACKEND_URL}/api/auth/refresh-token`,
            {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
                // If backend expects the cookie via header, but normally credentials: include is enough
                Cookie: `refreshToken=${refreshToken}`,
              },
            }
          );

          console.log("Refresh response status:", refreshResponse.status);

          if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            const newAccessToken = data.accessToken;
            console.log("Middleware got newAccessToken:", newAccessToken);

            const response = NextResponse.next();

            // Set new access token cookie
            response.cookies.set("accessToken", newAccessToken, {
              httpOnly: true,
              secure: true,
              sameSite: "lax",
              path: "/",
            });

            return response;
          }
        } catch (refreshErr) {
          console.error("Token refresh error:", refreshErr);
        }
      }

      // If refresh fails or no refreshToken, redirect to login
      const resp = NextResponse.redirect(new URL("/auth/login", request.url));
      resp.cookies.delete("accessToken");
      resp.cookies.delete("refreshToken");
      return resp;
    }
  }

  // No access token at all — if route is not public, redirect to login
  if (!publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
