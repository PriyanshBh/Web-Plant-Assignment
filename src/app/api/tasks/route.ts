import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { withAuth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Task } from "@/models/Task";
import { ok } from "@/lib/http";

/**
 * GET /api/tasks - Global search across all tasks owned by the authenticated user
 * Query parameters:
 *  - q: search keyword
 *  - limit: maximum results (default 20)
 */
export const GET = withAuth(async (req: NextRequest, { userId }) => {
  await connectToDatabase();

  const userObjectId = new mongoose.Types.ObjectId(userId);
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  const limitParam = parseInt(searchParams.get("limit") || "20", 10);
  const limit = isNaN(limitParam) ? 20 : Math.min(Math.max(limitParam, 1), 50);

  const query: Record<string, unknown> = {
    owner: userObjectId,
  };

  if (q) {
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.$or = [
      { title: { $regex: escaped, $options: "i" } },
      { description: { $regex: escaped, $options: "i" } },
    ];
  }

  const tasks = await Task.find(query)
    .populate<{ project: { _id: mongoose.Types.ObjectId; title: string } }>(
      "project",
      "title"
    )
    .sort({ updatedAt: -1 })
    .limit(limit)
    .lean();

  const result = tasks.map((t) => {
    const proj = t.project as { _id?: mongoose.Types.ObjectId; title?: string } | null;
    return {
      id: t._id.toString(),
      projectId: proj?._id ? proj._id.toString() : "",
      projectTitle: proj?.title || "Untitled Project",
      title: t.title,
      description: t.description || "",
      status: t.status,
      dueDate: t.dueDate ? new Date(t.dueDate).toISOString() : null,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    };
  });

  return ok(result);
});
