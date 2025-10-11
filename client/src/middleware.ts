// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const publicRoutes = ["/auth/login", "/auth/register"];
const superAdminRoutes = ["/super-admin", "/super-admin/:path*"];
const userRoutes = ["/home"];

export async function middleware(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  const bearerToken = authHeader.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null;

  const { pathname } = request.nextUrl;
  console.log("accessToken:", bearerToken);

  if (bearerToken) {
    try {
      const { payload } = await jwtVerify(
        bearerToken,
        new TextEncoder().encode(process.env.JWT_SECRET!)
      );

      const { role } = payload as { role: string };

      // Redirect logged-in users away from public routes
      if (publicRoutes.includes(pathname)) {
        return NextResponse.redirect(
          new URL(role === "SUPER_ADMIN" ? "/super-admin" : "/home", request.url)
        );
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
      console.error("Access token verification failed", err);
      // Try refresh
    }
  }

  // ➤ Try refresh with cookie-based refresh token
  try {
    const refreshRes = await fetch(`${request.nextUrl.origin}/auth/refresh-token`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (refreshRes.ok) {
      const data = await refreshRes.json();
      const newAccessToken = data.accessToken;

      if (newAccessToken) {
        const response = NextResponse.next();
        response.headers.set("authorization", `Bearer ${newAccessToken}`); // allow access in next middleware run if needed
        response.cookies.set("accessToken", newAccessToken, {
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          path: "/",
        });

        return response;
      }
    }
  } catch (e) {
    console.error("Refresh token failed", e);
  }

  // ➤ Redirect to login if refresh fails or no token
  if (!publicRoutes.includes(pathname)) {
    const resp = NextResponse.redirect(new URL("/auth/login", request.url));
    resp.cookies.delete("accessToken");
    resp.cookies.delete("refreshToken");
    return resp;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

