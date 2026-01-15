import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './lib/health/health.controller';
import { ProfileModule } from './lib/profile/profile.module';
import { UsersModule } from './lib/users/users.module';
import { User } from './lib/users/entities/user.entity';
import { Account } from './lib/auth/entities/account.entity';
import { Session } from './lib/auth/entities/session.entity';
import { Verification } from './lib/auth/entities/verification.entity';
import { UploadImage } from './lib/media/uploads/entities/upload-image.entity';
import { MediaModule } from './lib/media/media.module';
import { TodoModule } from './todo/todo.module';
import { Todo } from './todo/entities/todo.entity';
import { AuthModule } from './lib/auth/auth.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: configService.get<any>('DB_TYPE') || 'mysql',
        host: configService.get<string>('DB_SERVICE_NAME'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME', 'twin_user'),
        password: configService.get<string>('DB_PASSWORD', 'twin_password'),
        database: configService.get<string>('DB_NAME', 'twin_commerce'),
        autoLoadEntities: true,
        synchronize: true, // Auto-creates table. Recommended to disable in production
        dropSchema: false,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    TodoModule,
    ProfileModule,
    UsersModule,
    MediaModule,
  ],
  controllers: [HealthController],
})
export class AppModule { }