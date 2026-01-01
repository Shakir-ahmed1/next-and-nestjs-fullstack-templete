import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { User } from '../users/entities/user.entity';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), UploadsModule],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule { }
