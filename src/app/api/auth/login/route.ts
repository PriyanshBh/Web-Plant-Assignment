import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { loginSchema } from "@/lib/validators";
import { signToken } from "@/lib/jwt";
import { ok, fail, handleApiError, UnauthorizedError } from "@/lib/http";
import { setAuthCookie } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

// Pre-computed bcrypt hash (cost 12) used to equalize comparison timing for non-existent accounts
const DUMMY_BCRYPT_HASH =
  "$2a$12$c5hKjC7Q9Y32yvF1w6eU.u7Z0XgK7Cg2b8Y5mH8iJ0e3k1w2q4r5t";

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "anonymous";

    const rateLimit = checkRateLimit(`login:${ip}`, { max: 15, windowMs: 60 * 1000 });
    if (!rateLimit.allowed) {
      return fail(
        "RATE_LIMITED",
        "Too many login attempts. Please wait a moment before trying again.",
        429
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return fail("BAD_REQUEST", "Request body is required", 400);
    }

    const validatedData = loginSchema.parse(body);

    await connectToDatabase();

    const user = await User.findOne({ email: validatedData.email }).select(
      "+passwordHash"
    );

    if (!user) {
      // Execute dummy bcrypt compare to prevent timing-based user enumeration attacks
      await bcrypt.compare(validatedData.password, DUMMY_BCRYPT_HASH);
      throw new UnauthorizedError("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(
      validatedData.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const token = await signToken(user._id.toString());

    const response = ok({
      user: user.toJSON(),
      token,
    });

    setAuthCookie(response, token);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
