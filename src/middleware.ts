import { NextResponse, type NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { AUTH_COOKIE_NAME } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

  const isProtectedRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/projects");
  const isAuthRoute = pathname === "/login" || pathname === "/signup";

  let isAuthenticated = false;
  if (token) {
    const payload = await verifyToken(token);
    if (payload && payload.sub) {
      isAuthenticated = true;
    }
  }

  // Unauthenticated user trying to access protected route -> redirect to login with next param
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user trying to access login/signup -> redirect to dashboard
  if (isAuthRoute && isAuthenticated) {
    const dashboardUrl = new URL("/dashboard", req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/projects/:path*",
    "/login",
    "/signup",
  ],
};
