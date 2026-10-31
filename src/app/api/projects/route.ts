import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { withAuth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Project } from "@/models/Project";
import { Task } from "@/models/Task";
import { projectCreateSchema } from "@/lib/validators";
import { ok, fail } from "@/lib/http";

/**
 * GET /api/projects - List all projects for the authenticated user with task counts
 */
export const GET = withAuth(async (_req: NextRequest, { userId }) => {
  await connectToDatabase();

  const userObjectId = new mongoose.Types.ObjectId(userId);

  // 1. Fetch user's projects newest first
  const projects = await Project.find({ owner: userObjectId })
    .sort({ createdAt: -1 })
    .lean();

  if (projects.length === 0) {
    return ok([]);
  }

  const projectIds = projects.map((p) => p._id);

  const now = new Date();

  // 2. Aggregate task counts and overdue counts by project in a single performant query
  const countsAggregate = await Task.aggregate<{
    _id: mongoose.Types.ObjectId;
    total: number;
    todo: number;
    inProgress: number;
    done: number;
    overdue: number;
  }>([
    {
      $match: {
        project: { $in: projectIds },
        owner: userObjectId,
      },
    },
    {
      $group: {
        _id: "$project",
        total: { $sum: 1 },
        todo: { $sum: { $cond: [{ $eq: ["$status", "todo"] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0] } },
        done: { $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] } },
        overdue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ["$status", "done"] },
                  { $ne: ["$dueDate", null] },
                  { $lt: ["$dueDate", now] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  // Map counts per project id
  const countsMap = new Map<
    string,
    { total: number; todo: number; inProgress: number; done: number; overdue: number }
  >();

  for (const item of countsAggregate) {
    countsMap.set(item._id.toString(), {
      total: item.total,
      todo: item.todo,
      inProgress: item.inProgress,
      done: item.done,
      overdue: item.overdue,
    });
  }

  // Format projects with JSON transform and task counts
  const result = projects.map((proj) => {
    const id = proj._id.toString();
    return {
      id,
      owner: proj.owner.toString(),
      title: proj.title,
      description: proj.description || "",
      taskCounts: countsMap.get(id) || {
        total: 0,
        todo: 0,
        inProgress: 0,
        done: 0,
        overdue: 0,
      },
      createdAt: proj.createdAt.toISOString(),
      updatedAt: proj.updatedAt.toISOString(),
    };
  });

  return ok(result);
});

/**
 * POST /api/projects - Create a new project for the authenticated user
 */
export const POST = withAuth(async (req: NextRequest, { userId }) => {
  const body = await req.json().catch(() => null);
  if (!body) {
    return fail("BAD_REQUEST", "Request body is required", 400);
  }

  const validated = projectCreateSchema.parse(body);

  await connectToDatabase();

  const project = await Project.create({
    owner: new mongoose.Types.ObjectId(userId),
    title: validated.title,
    description: validated.description,
  });

  const responseData = {
    ...project.toJSON(),
    taskCounts: {
      total: 0,
      todo: 0,
      inProgress: 0,
      done: 0,
      overdue: 0,
    },
  };

  return ok(responseData, 201);
});
