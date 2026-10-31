import { NextRequest } from "next/server";
import { withAuth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { ok, UnauthorizedError } from "@/lib/http";

export const GET = withAuth(async (_req: NextRequest, { userId }) => {
  await connectToDatabase();

  const user = await User.findById(userId);
  if (!user) {
    throw new UnauthorizedError("User account not found");
  }

  return ok({ user: user.toJSON() });
});
