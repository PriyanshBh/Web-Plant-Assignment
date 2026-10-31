import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { withAuth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Project } from "@/models/Project";
import { Task } from "@/models/Task";
import { projectUpdateSchema, objectIdSchema } from "@/lib/validators";
import { ok, fail, NotFoundError } from "@/lib/http";

interface RouteParams {
  id: string;
}

async function getProjectTaskCounts(
  projectId: mongoose.Types.ObjectId,
  ownerId: mongoose.Types.ObjectId
) {
  const counts = await Task.aggregate<{ _id: string; count: number }>([
    {
      $match: {
        project: projectId,
        owner: ownerId,
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const result = {
    total: 0,
    todo: 0,
    inProgress: 0,
    done: 0,
  };

  for (const item of counts) {
    result.total += item.count;
    if (item._id === "todo") result.todo += item.count;
    else if (item._id === "in-progress") result.inProgress += item.count;
    else if (item._id === "done") result.done += item.count;
  }

  return result;
}

/**
 * GET /api/projects/:id - Get a single project owned by the user
 */
export const GET = withAuth<RouteParams>(
  async (_req: NextRequest, { userId, params }) => {
    const { id } = await params;
    objectIdSchema.parse(id);

    await connectToDatabase();

    const projectObjectId = new mongoose.Types.ObjectId(id);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const project = await Project.findOne({
      _id: projectObjectId,
      owner: userObjectId,
    });

    if (!project) {
      throw new NotFoundError("Project not found");
    }

    const taskCounts = await getProjectTaskCounts(projectObjectId, userObjectId);

    return ok({
      ...project.toJSON(),
      taskCounts,
    });
  }
);

/**
 * PATCH /api/projects/:id - Update an existing project owned by the user
 */
export const PATCH = withAuth<RouteParams>(
  async (req: NextRequest, { userId, params }) => {
    const { id } = await params;
    objectIdSchema.parse(id);

    const body = await req.json().catch(() => null);
    if (!body) {
      return fail("BAD_REQUEST", "Request body is required", 400);
    }

    const validated = projectUpdateSchema.parse(body);

    await connectToDatabase();

    const projectObjectId = new mongoose.Types.ObjectId(id);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const project = await Project.findOne({
      _id: projectObjectId,
      owner: userObjectId,
    });

    if (!project) {
      throw new NotFoundError("Project not found");
    }

    if (validated.title !== undefined) {
      project.title = validated.title;
    }
    if (validated.description !== undefined) {
      project.description = validated.description;
    }

    await project.save();

    const taskCounts = await getProjectTaskCounts(projectObjectId, userObjectId);

    return ok({
      ...project.toJSON(),
      taskCounts,
    });
  }
);

/**
 * DELETE /api/projects/:id - Delete a project and cascade delete all its tasks
 */
export const DELETE = withAuth<RouteParams>(
  async (_req: NextRequest, { userId, params }) => {
    const { id } = await params;
    objectIdSchema.parse(id);

    await connectToDatabase();

    const projectObjectId = new mongoose.Types.ObjectId(id);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const project = await Project.findOne({
      _id: projectObjectId,
      owner: userObjectId,
    });

    if (!project) {
      throw new NotFoundError("Project not found");
    }

    // Cascade delete all tasks belonging to this project
    const deletedTasksResult = await Task.deleteMany({
      project: projectObjectId,
      owner: userObjectId,
    });

    // Delete the project
    await Project.deleteOne({ _id: projectObjectId });

    return ok({
      id,
      deletedTasksCount: deletedTasksResult.deletedCount,
      message: "Project and its tasks were deleted successfully",
    });
  }
);
