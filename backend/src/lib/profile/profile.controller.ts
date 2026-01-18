import { Controller, Get, Put, Post, Delete, UseInterceptors, UploadedFile, UnauthorizedException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfileService } from './profile.service';
import { UploadsService } from '../media/uploads/uploads.service';
import { FilePurpose } from '../../common/enums/file-purpose.enum';
import { Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import 'multer';
import { CustomBody } from '../../decorators/custom-body.decorator';

@Controller('api/profile')
export class ProfileController {
    constructor(
        private profileService: ProfileService,
        private uploadsService: UploadsService
    ) { }

    @Get()
    async getProfile(@Session() session: UserSession) {
        if (!session) throw new UnauthorizedException();
        return this.profileService.findOne(session.user.id);
    }

    @Put()
    async updateProfile(@Session() session: UserSession, @CustomBody() body: { name: string; image: string }) {
        if (!session) throw new UnauthorizedException();
        const user = session.user;
        return this.profileService.update(user.id, {
            name: body.name,
            image: body.image,
            updatedAt: new Date(),
        });
    }

    @Post('avatar')
    @UseInterceptors(FileInterceptor('image'))
    async uploadAvatar(@Session() session: UserSession, @UploadedFile() file: Express.Multer.File, @CustomBody('purpose') purpose: string) {
        if (!session) throw new UnauthorizedException();
        const user = session.user;
        const uploadedImage = await this.uploadsService.upload(file, (purpose as FilePurpose) || FilePurpose.AVATAR, user.id);
        if (user.image) {
            await this.uploadsService.delete(user.image);
        }

        await this.profileService.update(user.id, { image: uploadedImage.fileUri });

        return uploadedImage;
    }

    @Delete('avatar')
    async deleteAvatar(@Session() session: UserSession) {
        if (!session) throw new UnauthorizedException();
        const user = session.user;
        if (user.image) {
            await this.uploadsService.delete(user.image);
            await this.profileService.update(user.id, { image: '' });
        }
        return { success: true };
    }
}
