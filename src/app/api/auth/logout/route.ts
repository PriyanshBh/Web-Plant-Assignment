import { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/http";
import { clearAuthCookie } from "@/lib/auth";

export async function POST(_req: NextRequest) {
  try {
    const response = ok({ message: "Logged out successfully" }, 200);
    clearAuthCookie(response);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
