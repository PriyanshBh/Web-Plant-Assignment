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

  // 2. Aggregate task counts by project and status in a single performant query
  const countsAggregate = await Task.aggregate<{
    _id: { project: mongoose.Types.ObjectId; status: string };
    count: number;
  }>([
    {
      $match: {
        project: { $in: projectIds },
        owner: userObjectId,
      },
    },
    {
      $group: {
        _id: { project: "$project", status: "$status" },
        count: { $sum: 1 },
      },
    },
  ]);

  // Map counts per project id
  const countsMap = new Map<
    string,
    { total: number; todo: number; inProgress: number; done: number }
  >();

  for (const item of countsAggregate) {
    const projId = item._id.project.toString();
    const status = item._id.status;
    const current = countsMap.get(projId) || {
      total: 0,
      todo: 0,
      inProgress: 0,
      done: 0,
    };

    current.total += item.count;
    if (status === "todo") current.todo += item.count;
    else if (status === "in-progress") current.inProgress += item.count;
    else if (status === "done") current.done += item.count;

    countsMap.set(projId, current);
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
    },
  };

  return ok(responseData, 201);
});
