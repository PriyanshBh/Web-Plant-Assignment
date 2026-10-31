import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { signupSchema } from "@/lib/validators";
import { signToken } from "@/lib/jwt";
import { ok, fail, handleApiError, ConflictError } from "@/lib/http";
import { setAuthCookie } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "anonymous";

    const rateLimit = checkRateLimit(`signup:${ip}`, { max: 10, windowMs: 60 * 1000 });
    if (!rateLimit.allowed) {
      return fail(
        "RATE_LIMITED",
        "Too many signup attempts. Please try again in a minute.",
        429
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return fail("BAD_REQUEST", "Request body is required", 400);
    }

    const validatedData = signupSchema.parse(body);

    await connectToDatabase();

    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      throw new ConflictError("An account with this email address already exists.");
    }

    // Hash password with cost 12
    const passwordHash = await bcrypt.hash(validatedData.password, 12);

    const user = await User.create({
      name: validatedData.name,
      email: validatedData.email,
      passwordHash,
    });

    const token = await signToken(user._id.toString());

    const response = ok(
      {
        user: user.toJSON(),
        token,
      },
      201
    );

    setAuthCookie(response, token);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
