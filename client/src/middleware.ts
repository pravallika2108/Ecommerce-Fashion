import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const publicRoutes = ["/auth/register", "/auth/login"];
const superAdminRoutes = ["/super-admin", "/super-admin/:path*"];
const userRoutes = ["/home"];

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const { pathname } = request.nextUrl;

  if (accessToken) {
    try {
      const { payload } = await jwtVerify(
        accessToken,
        new TextEncoder().encode(process.env.JWT_SECRET!)
      );
      const { role } = payload as { role: string };

      if (publicRoutes.includes(pathname)) {
        return NextResponse.redirect(
          new URL(role === "SUPER_ADMIN" ? "/super-admin" : "/home", request.url)
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
      console.error("Access token verification failed", e);

      // 🔄 Try to refresh the token
      try {
        const refreshResponse = await fetch(`${request.nextUrl.origin}/auth/refresh-token`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          const newAccessToken = data.accessToken;

          const response = NextResponse.next();
          response.cookies.set("accessToken", newAccessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "Lax",
            path: "/",
          });
          return response;
        }
      } catch (refreshError) {
        console.error("Refresh token failed", refreshError);
      }

      // 🔐 Redirect to login if refresh fails
      const resp = NextResponse.redirect(new URL("/auth/login", request.url));
      resp.cookies.delete("accessToken");
      resp.cookies.delete("refreshToken");
      return resp;
    }
  }

  // 🚫 No token and not on a public route? Redirect to login
  if (!publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
