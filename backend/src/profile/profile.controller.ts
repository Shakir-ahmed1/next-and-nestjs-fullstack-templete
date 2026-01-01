import { Controller, Get, Put, Post, Delete, Body, UseInterceptors, UploadedFile, Req, UnauthorizedException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfileService } from './profile.service';
import { UploadsService } from '../uploads/uploads.service';
import { FilePurpose } from '../common/enums/file-purpose.enum';
import { auth } from '../auth/auth';
import { fromNodeHeaders } from 'better-auth/node';
import 'multer';

@Controller('api/profile')
export class ProfileController {
    constructor(
        private profileService: ProfileService,
        private uploadsService: UploadsService
    ) { }

    private async getUser(req: any) {
        const a = fromNodeHeaders(req.headers);
        console.log("HEADERS", a)
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers)
        });
        console.log("SESSION", session) 
        if (!session) throw new UnauthorizedException();
        return session.user;
    }

    @Get()
    async getProfile(@Req() req) {
        const user = await this.getUser(req);
        return this.profileService.findOne(user.id);
    }

    @Put()
    async updateProfile(@Req() req, @Body() body: { name: string; image: string }) {
        const user = await this.getUser(req);
        return this.profileService.update(user.id, {
            name: body.name,
            image: body.image,
            updatedAt: new Date(),
        });
    }

    @Post('avatar')
    @UseInterceptors(FileInterceptor('image'))
    async uploadAvatar(@Req() req, @UploadedFile() file: Express.Multer.File, @Body('purpose') purpose: string) {
        const user = await this.getUser(req);
        const uploadedImage = await this.uploadsService.upload(file, (purpose as FilePurpose) || FilePurpose.AVATAR, user.id);

        await this.profileService.update(user.id, { image: uploadedImage.fileUri });

        return uploadedImage;
    }

    @Delete('avatar')
    async deleteAvatar(@Req() req) {
        const user = await this.getUser(req);
        if (user.image) {
            await this.uploadsService.delete(user.image);
            await this.profileService.update(user.id, { image: '' });
        }
        return { success: true };
    }
}
