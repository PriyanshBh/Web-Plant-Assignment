import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { withAuth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Task } from "@/models/Task";
import { taskUpdateSchema, objectIdSchema } from "@/lib/validators";
import { ok, fail, NotFoundError } from "@/lib/http";

interface RouteParams {
  id: string;
  taskId: string;
}

/**
 * PATCH /api/projects/:id/tasks/:taskId - Update a task (status, title, description, dueDate)
 */
export const PATCH = withAuth<RouteParams>(
  async (req: NextRequest, { userId, params }) => {
    const { id, taskId } = await params;
    objectIdSchema.parse(id);
    objectIdSchema.parse(taskId);

    const body = await req.json().catch(() => null);
    if (!body) {
      return fail("BAD_REQUEST", "Request body is required", 400);
    }

    const validated = taskUpdateSchema.parse(body);

    await connectToDatabase();

    const taskObjectId = new mongoose.Types.ObjectId(taskId);
    const projectObjectId = new mongoose.Types.ObjectId(id);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const task = await Task.findOne({
      _id: taskObjectId,
      project: projectObjectId,
      owner: userObjectId,
    });

    if (!task) {
      throw new NotFoundError("Task not found");
    }

    if (validated.title !== undefined) {
      task.title = validated.title;
    }
    if (validated.description !== undefined) {
      task.description = validated.description;
    }
    if (validated.status !== undefined) {
      task.status = validated.status;
    }
    if (validated.dueDate !== undefined) {
      task.dueDate = validated.dueDate;
    }

    await task.save();

    return ok(task.toJSON());
  }
);

/**
 * DELETE /api/projects/:id/tasks/:taskId - Delete a single task
 */
export const DELETE = withAuth<RouteParams>(
  async (_req: NextRequest, { userId, params }) => {
    const { id, taskId } = await params;
    objectIdSchema.parse(id);
    objectIdSchema.parse(taskId);

    await connectToDatabase();

    const taskObjectId = new mongoose.Types.ObjectId(taskId);
    const projectObjectId = new mongoose.Types.ObjectId(id);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const task = await Task.findOne({
      _id: taskObjectId,
      project: projectObjectId,
      owner: userObjectId,
    });

    if (!task) {
      throw new NotFoundError("Task not found");
    }

    await Task.deleteOne({ _id: taskObjectId });

    return ok({
      id: taskId,
      message: "Task deleted successfully",
    });
  }
);
