import { Logger, Module } from '@nestjs/common';
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
import { Organization } from './lib/auth/entities/organization.entity';
import { Member } from './lib/auth/entities/member.entity';
import { Invitation } from './lib/auth/entities/invitation.entity';
import { MediaModule } from './lib/media/media.module';
import { TodoModule } from './todo/todo.module';
import { Todo } from './todo/entities/todo.entity';
import { OrganizationsModule } from './lib/organizations/organizations.module';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { getBetterAuthConfig } from './lib/auth/auth';
import { DataSource } from "typeorm";
import { LoggerModule } from 'nestjs-pino';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { AuthLoggingInterceptor } from './common/interceptors/auth-logging.interceptor';



@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const nodeEnv = configService.get('NODE_ENV', 'development');
        return {
          pinoHttp: {
            level: configService.get('LOG_LEVEL', nodeEnv === 'production' ? 'info' : 'debug'),
            transport: nodeEnv !== 'production'
              ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  singleLine: true,
                  translateTime: 'SYS:standard',
                },
              }
              : undefined,
            // Custom request/response serializing
            serializers: {
              req: (req) => ({
                id: req.id,
                method: req.method,
                url: req.url,
                query: req.query,
                params: req.params,
                // Avoid logging sensitive headers like Authorization
                headers: {
                  ...req.headers,
                  authorization: req.headers.authorization ? '***' : undefined,
                  cookie: req.headers.cookie ? '***' : undefined,
                },
              }),
            },
            autoLogging: true,
          },
        };
      },
    }),


    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: configService.get<any>('DB_TYPE') || 'mysql',
        host: configService.get<string>('DB_SERVICE_NAME'),
        port: configService.get<number>('DB_PORT'),
        username: 'root',
        password: 'root_password',
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true, // Auto-creates table. Recommended to disable in production
        dropSchema: false,
      }),
      inject: [ConfigService],
    }),
    AuthModule.forRootAsync({
      isGlobal: true,
      imports: [TypeOrmModule.forFeature([User, Account, Session, Verification, Organization, Member, Invitation])],
      inject: [ConfigService, DataSource],
      useFactory: (config: ConfigService, dataSource: DataSource) => ({
        auth: getBetterAuthConfig(config, dataSource),
      }),
    }),
    TodoModule,
    ProfileModule,
    UsersModule,
    MediaModule,
    OrganizationsModule,
    TypeOrmModule.forFeature([
      User,
      Account,
      Session,
      Verification,
      Organization,
      Member,
      Invitation,
    ])
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuthLoggingInterceptor,
    },
  ],

})
export class AppModule { }