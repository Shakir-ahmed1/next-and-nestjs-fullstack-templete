import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadImage } from './entities/upload-image.entity';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { FilePurpose } from '../../../common/enums/file-purpose.enum';

@Injectable()
export class UploadsService {
    constructor(
        @InjectRepository(UploadImage)
        private uploadImageRepository: Repository<UploadImage>,
        private configService: ConfigService,
    ) { }

    async upload(file: Express.Multer.File, purpose: FilePurpose, userId: string): Promise<UploadImage> {
        if (!file) throw new BadRequestException('No file provided');

        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException(`Unsupported file type: ${file.mimetype}`);
        }

        const baseDir = this.configService.get<string>('FILE_UPLOAD_BASE_DIR') || path.join(process.cwd(), 'uploads', 'files', 'images');
        const purposeDir = path.join(baseDir, purpose.toLowerCase());

        if (!existsSync(purposeDir)) {
            mkdirSync(purposeDir, { recursive: true });
        }

        const ext = path.extname(file.originalname);
        const randomName = `${uuidv4()}${ext}`;
        const filePath = path.join(purposeDir, randomName);
        const fileUri = `/api/media/files/images/${purpose.toLowerCase()}/${randomName}`;

        await fs.writeFile(filePath, file.buffer);

        const uploadImage = this.uploadImageRepository.create({
            fileName: randomName,
            fileUri,
            filePath,
            purpose,
            mimeType: file.mimetype,
            size: file.size,
            userId,
        });

        return this.uploadImageRepository.save(uploadImage);
    }

    async delete(fileUri: string): Promise<void> {
        const image = await this.uploadImageRepository.findOne({ where: { fileUri } });
        if (image) {
            try {
                await fs.unlink(image.filePath);
            } catch (error: any) {
                if (error.code !== 'ENOENT') console.error('Error deleting file', error);
            }
            await this.uploadImageRepository.remove(image);
        }
    }

    async findByUri(fileUri: string) {
        return this.uploadImageRepository.findOne({ where: { fileUri } });
    }
}
