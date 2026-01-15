import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadsService } from './uploads.service';
import { UploadImage } from './entities/upload-image.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([UploadImage]), ConfigModule],
  providers: [UploadsService],
  exports: [UploadsService],
})
export class UploadsModule { }
