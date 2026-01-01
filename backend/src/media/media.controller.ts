import { Controller, Get, Param, Res, NotFoundException, StreamableFile, Req, BadRequestException } from '@nestjs/common';
import { UploadsService } from '../uploads/uploads.service';
import { createReadStream } from 'fs';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs/promises';

@Controller('api/media')
export class MediaController {
    constructor(
        private uploadsService: UploadsService,
        private configService: ConfigService
    ) { }

    @Get('files/*')
    async getFile(@Req() req: any, @Res({ passthrough: true }) res: Response) {
        // Parse path from URL since @Param('path') might not capture everything cleanly with leading slashes or structure
        const url = new URL(req.url, `http://${req.headers.host}`);
        const fileUri = url.pathname;

        const uploadedFile = await this.uploadsService.findByUri(fileUri);
        if (!uploadedFile) throw new NotFoundException('Image not found');

        const { filePath, mimeType, fileName } = uploadedFile;
        // Security check
        const baseDir = this.configService.get<string>('FILE_UPLOAD_BASE_DIR') || path.join(process.cwd(), 'uploads', 'files', 'images');
        const resolvedPath = path.resolve(filePath);
        if (!resolvedPath.startsWith(path.resolve(baseDir))) {
            throw new NotFoundException(); // Dont expose security issues
        }

        try {
            await fs.access(resolvedPath);
        } catch {
            throw new NotFoundException('File not found on disk');
        }

        res.set({
            'Content-Type': mimeType,
            'Content-Disposition': `inline; filename="${encodeURIComponent(fileName)}"`,
            'Cache-Control': 'public, max-age=31536000, immutable',
            'X-Content-Type-Options': 'nosniff',
        });

        const file = createReadStream(resolvedPath);
        return new StreamableFile(file);
    }
}
