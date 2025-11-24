// app/api/media/files/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { uploadImage } from '@/lib/upload-file';
import { FILE_UPLOAD_BASE_DIR } from '@/config';
import prisma from '@/lib/prisma';
import { badRequestError, handleError, notFoundError, unauthorizedError } from '@/lib/errors';
import { withErrorHandler } from '@/lib/withErrorHandler';



export async function getUserAvatar(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
    const { path: relativePathSegments } = await params;

    if (!relativePathSegments || relativePathSegments.length === 0) {
        throw badRequestError("Invalid file path");
    }

    const requestUrl = new URL(request.url);
    const fileUri = requestUrl.pathname; // e.g. "/api/media/files/images/avatar/abc.jpg"

    try {
        // 1. Check database for the file record (security critical!)
        const uploadedFile = await prisma.uploadImage.findFirst({
            where: {
                fileUri: fileUri,
            },
            select: {
                filePath: true,
                mimeType: true,
                fileName: true, // optional: for Content-Disposition
            },
        });

        if (!uploadedFile) {
            throw notFoundError('Image')
        }

        const { filePath: safeFilePath, mimeType, fileName } = uploadedFile;

        // 2. Resolve absolute path and prevent directory traversal
        const resolvedPath = path.resolve(safeFilePath);
        if (!resolvedPath.startsWith(path.resolve(FILE_UPLOAD_BASE_DIR))) {
            console.warn('Directory traversal attempt:', safeFilePath);
            throw unauthorizedError()
        }

        // 3. Check if file actually exists on disk
        await fs.access(resolvedPath);

        // 4. Stream the file (memory efficient + supports large files)
        const fileBuffer = await fs.readFile(resolvedPath);
        const headers = new Headers();

        // Set content type
        headers.set('Content-Type', mimeType || 'application/octet-stream');

        // Optional: Nice filename for download
        if (fileName) {
            headers.set(
                'Content-Disposition',
                `inline; filename="${encodeURIComponent(fileName)}"`
            );
        }

        // Caching (adjust based on your needs)
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');

        // Security headers
        headers.set('X-Content-Type-Options', 'nosniff');

        return new NextResponse(fileBuffer, {
            status: 200,
            headers,
        });
    } catch (error: any) {
            if (error.code === 'ENOENT') {
                throw notFoundError('File')
            }
            throw error;
    }
}

export const GET = withErrorHandler(getUserAvatar)