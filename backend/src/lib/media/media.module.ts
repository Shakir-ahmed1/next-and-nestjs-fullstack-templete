import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { UploadsModule } from './uploads/uploads.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [UploadsModule, ConfigModule],
  controllers: [MediaController],
  providers: [MediaService],
})
export class MediaModule { }
