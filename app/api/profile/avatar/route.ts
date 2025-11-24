// app/api/upload-image/route.ts
import { NextResponse } from 'next/server';
import path from 'path';
import { uploadImage, deleteImage } from '@/lib/upload-file';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-helpers';
import { badRequestError } from '@/lib/errors';
import { FILE_UPLOAD_BASE_DIR } from '@/config';
import { withErrorHandler } from '@/lib/withErrorHandler';

export async function postUserAvatar(req: Request) {
    const user = await getAuthUser()
    const formData = await req.formData();
    const file = formData.get('image');

    if (!file || !(file instanceof File)) {
      throw badRequestError('No file uploaded. Expected field: "image"')
    }

    // Convert File → Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    const originalName = file.name;
    const mimeType = file.type || 'application/octet-stream';

    // Meta fields
    const purpose = (formData.get('purpose') as string) || 'avatar';
    const authUserId = user.id

    // Where files get saved
    const baseDir =
      FILE_UPLOAD_BASE_DIR ||
      path.join(process.cwd(), 'uploads', 'files', 'images');
    console.log("baseDir", baseDir)
    const uploadedImage = await uploadImage({
      buffer,
      originalName,
      mimeType,
      purpose: purpose as 'avatar' | 'product',
      baseDir,
      authUserId
    });

    return NextResponse.json({ ...uploadedImage }, { status: 201 });

}

export async function deleteUserAvatar(req: Request) {
    const user = await getAuthUser()
    const image = user?.image;
    if (image) {
      await prisma.$transaction(async (tx) => {

        await deleteImage(tx, image);
        await tx.user.update({
          where: {id: user.id},
          data: {image: ''}
        })
      });

      return NextResponse.json({ success: true });
    }
    else {
      throw badRequestError("No avatar found")
    }

}
export const DELETE = withErrorHandler(deleteUserAvatar)
export const POST = withErrorHandler(postUserAvatar)
