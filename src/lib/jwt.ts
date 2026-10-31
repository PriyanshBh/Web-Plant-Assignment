import { SignJWT, jwtVerify } from "jose";

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "FATAL: JWT_SECRET must be defined in environment and at least 32 characters long."
    );
  }
  return new TextEncoder().encode(secret);
}

const DEFAULT_EXPIRATION = process.env.JWT_EXPIRES_IN || "7d";

export interface JWTPayload {
  sub: string;
  [key: string]: unknown;
}

/**
 * Sign a JWT using jose (compatible with Edge Middleware & Node.js)
 */
export async function signToken(
  userId: string,
  expiresIn: string = DEFAULT_EXPIRATION
): Promise<string> {
  const key = getSecretKey();
  return await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(key);
}

/**
 * Verify a JWT using jose. Returns payload or null if invalid/expired.
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const key = getSecretKey();
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });

    if (!payload.sub) {
      return null;
    }

    return {
      sub: payload.sub,
      ...payload,
    };
  } catch {
    return null;
  }
}
