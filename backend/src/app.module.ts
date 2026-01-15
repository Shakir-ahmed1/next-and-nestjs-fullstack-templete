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
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { getBetterAuthConfig } from './lib/auth/auth';
import { DataSource } from "typeorm";
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: configService.get<any>('DB_TYPE') || 'mysql',
        host: configService.get<string>('DB_SERVICE_NAME'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true, // Auto-creates table. Recommended to disable in production
        dropSchema: false,
      }),
      inject: [ConfigService],
    }),
    AuthModule.forRootAsync({
      disableGlobalAuthGuard: true,
      isGlobal: true,
      imports: [TypeOrmModule.forFeature([User, Account, Session, Verification])],
      inject: [ConfigService, DataSource],
      useFactory: (config: ConfigService, dataSource: DataSource) => ({
        auth: getBetterAuthConfig(config, dataSource),
      }),
    }),
    TodoModule,
    ProfileModule,
    UsersModule,
    MediaModule,
    TypeOrmModule.forFeature([
      User,
      Account,
      Session,
      Verification,
    ])
  ],
  controllers: [HealthController],
})
export class AppModule { }