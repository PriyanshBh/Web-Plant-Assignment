import { z } from "zod";

// MongoDB ObjectId validation schema (24 hex characters)
export const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid ID format" });

// Password complexity: minimum 8 characters, at least 1 letter and 1 number
export const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long" })
  .regex(/[A-Za-z]/, { message: "Password must contain at least one letter" })
  .regex(/[0-9]/, { message: "Password must contain at least one number" });

// User Signup Schema
export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters long" })
    .max(60, { message: "Name cannot exceed 60 characters" }),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: "Please provide a valid email address" }),
  password: passwordSchema,
});

export type SignupInput = z.infer<typeof signupSchema>;

// User Login Schema
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: "Please provide a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Project Create Schema
export const projectCreateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: "Title is required" })
    .max(80, { message: "Title cannot exceed 80 characters" }),
  description: z
    .string()
    .trim()
    .max(500, { message: "Description cannot exceed 500 characters" })
    .default(""),
});

export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;

// Project Update Schema
export const projectUpdateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: "Title cannot be empty" })
    .max(80, { message: "Title cannot exceed 80 characters" })
    .optional(),
  description: z
    .string()
    .trim()
    .max(500, { message: "Description cannot exceed 500 characters" })
    .optional(),
});

export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;

// Task Status Enum
export const taskStatusSchema = z.enum(["todo", "in-progress", "done"], {
  message: "Status must be todo, in-progress, or done",
});

// Task Create Schema
export const taskCreateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: "Title is required" })
    .max(120, { message: "Title cannot exceed 120 characters" }),
  description: z
    .string()
    .trim()
    .max(1000, { message: "Description cannot exceed 1000 characters" })
    .default(""),
  status: taskStatusSchema.default("todo"),
  dueDate: z
    .union([z.string().datetime(), z.string().date(), z.string().length(0), z.null()])
    .optional()
    .transform((val) => {
      if (!val || val === "") return null;
      const d = new Date(val);
      return isNaN(d.getTime()) ? null : d;
    }),
});

export type TaskCreateInput = z.infer<typeof taskCreateSchema>;

export interface TaskCreatePayload {
  title: string;
  description?: string;
  status?: "todo" | "in-progress" | "done";
  dueDate?: string | null;
}

// Task Update Schema
export const taskUpdateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: "Title cannot be empty" })
    .max(120, { message: "Title cannot exceed 120 characters" })
    .optional(),
  description: z
    .string()
    .trim()
    .max(1000, { message: "Description cannot exceed 1000 characters" })
    .optional(),
  status: taskStatusSchema.optional(),
  dueDate: z
    .union([z.string().datetime(), z.string().date(), z.string().length(0), z.null()])
    .optional()
    .transform((val) => {
      if (val === undefined) return undefined;
      if (!val || val === "") return null;
      const d = new Date(val);
      return isNaN(d.getTime()) ? null : d;
    }),
});

export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;

export interface TaskUpdatePayload {
  title?: string;
  description?: string;
  status?: "todo" | "in-progress" | "done";
  dueDate?: string | null;
}

// Task Query Filters Schema
export const taskQuerySchema = z.object({
  status: z.enum(["todo", "in-progress", "done", "all"]).default("all"),
  sort: z.enum(["dueDate", "createdAt"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  q: z.string().trim().optional(),
});

export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
