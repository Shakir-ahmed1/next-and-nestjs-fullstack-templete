// src/lib/withErrorHandler.ts
import { NextRequest, NextResponse } from 'next/server';
import { handleError } from '@/lib/errors';

type Handler = (req: NextRequest, params: any) => Promise<NextResponse>;

export function withErrorHandler(handler: Handler) {
  return async (req: NextRequest, { params }: { params: any }) => {
    try {
      return await handler(req, { params });
    } catch (error) {
      return handleError(error);
    }
  };
}