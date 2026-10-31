import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { withAuth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Project } from "@/models/Project";
import { Task } from "@/models/Task";
import { taskCreateSchema, taskQuerySchema, objectIdSchema } from "@/lib/validators";
import { ok, fail, NotFoundError } from "@/lib/http";

interface RouteParams {
  id: string;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * GET /api/projects/:id/tasks - List tasks for a project with filter, sort, and search
 */
export const GET = withAuth<RouteParams>(
  async (req: NextRequest, { userId, params }) => {
    const { id } = await params;
    objectIdSchema.parse(id);

    await connectToDatabase();

    const projectObjectId = new mongoose.Types.ObjectId(id);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Verify ownership of the parent project
    const project = await Project.findOne({
      _id: projectObjectId,
      owner: userObjectId,
    });

    if (!project) {
      throw new NotFoundError("Project not found");
    }

    // Parse query params
    const searchParams = req.nextUrl.searchParams;
    const queryInput = {
      status: searchParams.get("status") || "all",
      sort: searchParams.get("sort") || "createdAt",
      order: searchParams.get("order") || "desc",
      q: searchParams.get("q") || undefined,
    };

    const validatedQuery = taskQuerySchema.parse(queryInput);

    // Build match conditions
    const matchCondition: Record<string, any> = {
      project: projectObjectId,
      owner: userObjectId,
    };

    if (validatedQuery.status !== "all") {
      matchCondition.status = validatedQuery.status;
    }

    if (validatedQuery.q && validatedQuery.q.trim() !== "") {
      matchCondition.title = {
        $regex: escapeRegExp(validatedQuery.q.trim()),
        $options: "i",
      };
    }

    // Build pipeline: tasks with no dueDate sort last when sorting by dueDate
    const pipeline: any[] = [{ $match: matchCondition }];

    if (validatedQuery.sort === "dueDate") {
      const sortDirection = validatedQuery.order === "asc" ? 1 : -1;
      pipeline.push(
        {
          $addFields: {
            hasDueDate: {
              $cond: [{ $ifNull: ["$dueDate", false] }, 1, 0],
            },
          },
        },
        {
          $sort: {
            hasDueDate: -1, // Tasks with due date first, tasks without due date last
            dueDate: sortDirection,
            createdAt: -1,
          },
        }
      );
    } else {
      const sortDirection = validatedQuery.order === "asc" ? 1 : -1;
      pipeline.push({
        $sort: {
          createdAt: sortDirection,
        },
      });
    }

    const tasks = await Task.aggregate(pipeline);

    // Format tasks to match standard JSON serialization
    const formattedTasks = tasks.map((task) => ({
      id: task._id.toString(),
      project: task.project.toString(),
      owner: task.owner.toString(),
      title: task.title,
      description: task.description || "",
      status: task.status,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
      createdAt: new Date(task.createdAt).toISOString(),
      updatedAt: new Date(task.updatedAt).toISOString(),
    }));

    return ok(formattedTasks);
  }
);

/**
 * POST /api/projects/:id/tasks - Create a new task within a project
 */
export const POST = withAuth<RouteParams>(
  async (req: NextRequest, { userId, params }) => {
    const { id } = await params;
    objectIdSchema.parse(id);

    const body = await req.json().catch(() => null);
    if (!body) {
      return fail("BAD_REQUEST", "Request body is required", 400);
    }

    const validated = taskCreateSchema.parse(body);

    await connectToDatabase();

    const projectObjectId = new mongoose.Types.ObjectId(id);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Ensure user owns the parent project
    const project = await Project.findOne({
      _id: projectObjectId,
      owner: userObjectId,
    });

    if (!project) {
      throw new NotFoundError("Project not found");
    }

    const task = await Task.create({
      project: projectObjectId,
      owner: userObjectId,
      title: validated.title,
      description: validated.description,
      status: validated.status,
      dueDate: validated.dueDate,
    });

    return ok(task.toJSON(), 201);
  }
);
