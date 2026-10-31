import { NextResponse } from "next/server";
import { ZodError } from "zod";

export interface ApiSuccessResponse<T> {
  data: T;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}

export class HttpError extends Error {
  status: number;
  code: string;
  fields?: Record<string, string>;

  constructor(
    message: string,
    status = 400,
    code = "BAD_REQUEST",
    fields?: Record<string, string>
  ) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

export class ValidationError extends HttpError {
  constructor(message = "Validation failed", fields?: Record<string, string>) {
    super(message, 422, "VALIDATION_ERROR", fields);
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = "Authentication required") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = "Access denied") {
    super(message, 403, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends HttpError {
  constructor(message = "Resource not found") {
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class ConflictError extends HttpError {
  constructor(message = "Resource already exists") {
    super(message, 409, "CONFLICT");
    this.name = "ConflictError";
  }
}

/**
 * Standard success response wrapper
 */
export function ok<T>(data: T, status = 200, init?: ResponseInit): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ data }, { status, ...init });
}

/**
 * Standard failure response wrapper
 */
export function fail(
  code: string,
  message: string,
  status = 400,
  fields?: Record<string, string>,
  init?: ResponseInit
): NextResponse<ApiErrorResponse> {
  const errorPayload: ApiErrorResponse["error"] = { code, message };
  if (fields && Object.keys(fields).length > 0) {
    errorPayload.fields = fields;
  }
  return NextResponse.json({ error: errorPayload }, { status, ...init });
}

/**
 * Global API error handler ensuring no leaked stack traces
 */
export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  if (error instanceof HttpError) {
    return fail(error.code, error.message, error.status, error.fields);
  }

  if (error instanceof ZodError) {
    const fields: Record<string, string> = {};
    for (const issue of error.issues) {
      const fieldPath = issue.path.join(".");
      if (!fields[fieldPath]) {
        fields[fieldPath] = issue.message;
      }
    }
    return fail("VALIDATION_ERROR", "Invalid input data", 422, fields);
  }

  // Handle mongoose CastError (invalid ObjectId)
  if (
    error &&
    typeof error === "object" &&
    "name" in error &&
    error.name === "CastError"
  ) {
    return fail("INVALID_ID", "Invalid identifier provided", 400);
  }

  // Server-side logging only
  console.error("Unhandled API Error:", error);

  return fail(
    "INTERNAL_SERVER_ERROR",
    "An unexpected error occurred. Please try again later.",
    500
  );
}
