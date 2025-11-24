// services/uploadImage.ts
import fs from 'fs/promises';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';
import prisma from './prisma';

export type FilePurpose = 'avatar' | 'product';

export interface UploadImageParams {
  buffer: Buffer;             // file bytes
  originalName: string;       // original filename (used for extension)
  mimeType: string;           // e.g. image/jpeg
  purpose: FilePurpose;       // 'avatar' | 'product' (expand as needed)
  baseDir: string;            // filesystem root where files are stored
  authUserId: string
}

/**
 * Upload an image file to disk and create a UploadImage record.
 * Returns { fileUri, uploadedImage }.
 *
 * Throws errors on validation / disk / db problems.
 */
export async function uploadImage(params: UploadImageParams) {
  const { buffer, originalName, mimeType, purpose, authUserId, baseDir = null } = params;

  // Basic validation
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error('Invalid file buffer provided.');
  }
  if (!originalName || typeof originalName !== 'string') {
    throw new Error('Original filename is required.');
  }
  if (!mimeType || !mimeType.startsWith('image/')) {
    throw new Error('Only image files are allowed.');
  }

  // Allowed image types (extend if needed)
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
    throw new Error(`Unsupported image type: ${mimeType}`);
  }

  // Ensure baseDir exists and create purpose subdir
  const purposeDir = path.join(baseDir || '', purpose.toLowerCase());
  if (!existsSync(purposeDir)) {
    mkdirSync(purposeDir, { recursive: true });
  }

  // Generate random filename + preserve extension
  const ext = path.extname(originalName) || '';
  const randomName = `${uuidv4()}${ext}`;
  const filePath = path.join(purposeDir, randomName);

  // Public URI pattern (adjust to your static-serving setup)
  const fileUri = `/api/media/files/images/${purpose.toLowerCase()}/${randomName}`;

  // Write file to disk
  await fs.writeFile(filePath, buffer);
  // Persist to DB inside a transaction
  const uploadedImage = await prisma.$transaction(async (tx) => {
    const created = await tx.uploadImage.create({
      data: {
        fileName: randomName,
        fileUri,
        filePath,
        purpose,
        mimeType,
        size: buffer.length,
        // createdBy,
      },
    });
    await tx.user.update({
      where: {id: authUserId},
      data: {
        image: fileUri
      }
    })
    return created;
  });

  return uploadedImage;
}

/**
 * Delete image both from disk and DB.
 * Accepts a transaction-capable prisma client (or the main prisma client).
 *
 * tx can be prisma (PrismaClient) or a transaction client returned inside $transaction callback.
 */
export async function deleteImage(
  tx: PrismaClient | any,
  fileUri: string,
) {
  // Find the uploaded image record
  const fileRecord = await tx.uploadImage.findFirst({
    where: { fileUri },
  });

  if (!fileRecord) {
    // nothing to delete
    return true;
  }

  // Delete file from disk (ignore ENOENT)
  try {
    await fs.unlink(fileRecord.filePath);
  } catch (err: any) {
    if (err && err.code !== 'ENOENT') {
      console.error('Error deleting file from disk:', err);
      throw err;
    }
  }

  // Delete DB record
  await tx.uploadImage.delete({
    where: { id: fileRecord.id },
  });

  return true;
}
