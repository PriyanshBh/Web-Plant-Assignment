import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./jwt";
import { UnauthorizedError, handleApiError } from "./http";

export const AUTH_COOKIE_NAME = "token";

/**
 * Extracts JWT token from either httpOnly cookie or Authorization: Bearer header
 */
export function extractToken(req: NextRequest): string | null {
  // 1. Check Cookie first
  const cookieToken = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (cookieToken) {
    return cookieToken;
  }

  // 2. Check Authorization Header (supports Bearer <token> for curl/Postman)
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.substring(7).trim();
  }

  return null;
}

/**
 * Verifies token and returns authenticated user info or null
 */
export async function getAuthUser(
  req: NextRequest
): Promise<{ userId: string } | null> {
  const token = extractToken(req);
  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);
  if (!payload || !payload.sub) {
    return null;
  }

  return { userId: payload.sub };
}

/**
 * Sets httpOnly secure authentication cookie on response
 */
export function setAuthCookie(res: NextResponse, token: string): void {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  });
}

/**
 * Clears authentication cookie on response (for logout)
 */
export function clearAuthCookie(res: NextResponse): void {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export type AuthenticatedRouteHandler<P = any> = (
  req: NextRequest,
  context: { userId: string; params: Promise<P> }
) => Promise<NextResponse | Response>;

/**
 * Route protection wrapper for Next.js App Router API endpoints
 */
export function withAuth<P = any>(handler: AuthenticatedRouteHandler<P>) {
  return async (
    req: NextRequest,
    routeContext: { params: Promise<P> }
  ): Promise<NextResponse | Response> => {
    try {
      const auth = await getAuthUser(req);
      if (!auth) {
        throw new UnauthorizedError("Authentication token is missing or invalid");
      }

      return await handler(req, {
        userId: auth.userId,
        params: routeContext.params,
      });
    } catch (error) {
      return handleApiError(error);
    }
  };
}
