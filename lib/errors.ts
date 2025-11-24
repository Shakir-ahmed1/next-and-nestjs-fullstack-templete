import { NextResponse } from "next/server";

// src/lib/errors.ts
export class AppError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: any,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Helper factories (same as before)
export const notFoundError = (entity: string, id?: number | string) =>
{
    if (id) return new AppError(404, 'NOT_FOUND', `${entity} with ID ${id} not found`);
    else return new AppError(404, 'NOT_FOUND', `${entity} not found`);
}

export const unauthorizedError = (message = 'Authentication required') =>
  new AppError(401, 'UNAUTHORIZED', message);

export const forbiddenError = (message = 'Access denied') =>
  new AppError(403, 'FORBIDDEN', message);

export const badRequestError = (message: string, details?: any) =>
  new AppError(400, 'INVALID_INPUT', message, details);

/**
 * Global error handler for Next.js API routes
 * Use it at the top level of every route handler (or in middleware)
 */
export function handleError(error: unknown) {
  console.error('API Error:', error);

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      { status: error.status },
    );
  }

  // Unexpected errors
  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    },
    { status: 500 },
  );
}

/**
 * Compute diff between two objects (useful for audit logs)
 */
export function computeDiff(
  oldObj: Record<string, any>,
  newObj: Record<string, any>,
): Record<string, { old: any; new: any }> {
  const diff: Record<string, { old: any; new: any }> = {};

  for (const key of Object.keys(newObj)) {
    if (JSON.stringify(oldObj[key]) !== JSON.stringify(newObj[key])) {
      diff[key] = { old: oldObj[key], new: newObj[key] };
    }
  }

  return diff;
}