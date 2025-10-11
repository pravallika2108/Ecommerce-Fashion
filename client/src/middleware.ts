import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const publicRoutes = ["/auth/register", "/auth/login"];
const superAdminRoutes = ["/super-admin", "/super-admin/:path*"];
const userRoutes = ["/home"];

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://ecommerce-fashion-03io.onrender.com";

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

      // User is authenticated
      if (publicRoutes.includes(pathname)) {
        return NextResponse.redirect(
          new URL(
            role === "SUPER_ADMIN" ? "/super-admin" : "/home",
            request.url
          )
        );
      }

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
    } catch (e) {
      console.error("Token verification failed:", e);

      // Token expired, try to refresh
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
            const response = NextResponse.next();
            const setCookieHeader = refreshResponse.headers.get("set-cookie");
            if (setCookieHeader) {
              response.headers.set("set-cookie", setCookieHeader);
            }
            return response;
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
        }
      }

      // Refresh failed or no refresh token
      const response = NextResponse.redirect(
        new URL("/auth/login", request.url)
      );
      response.cookies.delete("accessToken");
      response.cookies.delete("refreshToken");
      return response;
    }
  }

  // No access token
  if (!publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
