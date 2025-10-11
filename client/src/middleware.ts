import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const publicRoutes = ["/auth/register", "/auth/login"];
const superAdminRoutes = ["/super-admin", "/super-admin/:path*"];
const userRoutes = ["/home"];

export async function middleware(request: NextRequest) {
  // 1. Read access token from Authorization header Bearer token
  const authHeader = request.headers.get("authorization") || "";
  const accessToken = authHeader.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null;

  const { pathname } = request.nextUrl;

  if (accessToken) {
    try {
      // Verify access token
      const { payload } = await jwtVerify(
        accessToken,
        new TextEncoder().encode(process.env.JWT_SECRET!)
      );
      const { role } = payload as { role: string };

      // Redirect logged-in users away from public routes
      if (publicRoutes.includes(pathname)) {
        return NextResponse.redirect(
          new URL(role === "SUPER_ADMIN" ? "/super-admin" : "/home", request.url)
        );
      }

      // Role based redirects
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

      // All good, continue
      return NextResponse.next();
    } catch (e) {
      console.error("Access token verification failed", e);

      // Try to refresh the token using refresh token cookie
      try {
        const refreshResponse = await fetch(`${request.nextUrl.origin}/auth/refresh-token`, {
          method: "POST",
          credentials: "include", // sends cookies (refresh token)
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          const newAccessToken = data.accessToken;

          const response = NextResponse.next();
          // Set the new access token as a cookie (HttpOnly)
          response.cookies.set("accessToken", newAccessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/",
          });
          return response;
        }
      } catch (refreshError) {
        console.error("Refresh token failed", refreshError);
      }

      // If refresh fails, redirect to login and clear cookies
      const resp = NextResponse.redirect(new URL("/auth/login", request.url));
      resp.cookies.delete("accessToken");
      resp.cookies.delete("refreshToken");
      return resp;
    }
  }

  // No access token in header & not on public route, redirect to login
  if (!publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Public route, allow access
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
