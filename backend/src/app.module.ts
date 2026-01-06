import { Module, Controller, Get, Post, Body } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, InjectRepository } from '@nestjs/typeorm';
import { dbName, dbPassword, dbUsername } from 'config';
import { Entity, PrimaryGeneratedColumn, Column, Repository } from 'typeorm';
import { HealthController } from './lib/health/health.controller';
import { CustomBody } from './decorators/custom-body.decorator';
import { ProfileController } from './profile/profile.controller';
import { ProfileModule } from './profile/profile.module';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { Account } from './auth/entities/account.entity';
import { Session } from './auth/entities/session.entity';
import { Verification } from './auth/entities/verification.entity';
import { UploadImage } from './uploads/entities/upload-image.entity';
import { MediaModule } from './media/media.module';

// 1. THE ENTITY
@Entity()
export class Todo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'abcd' })
  task: string;
}

// 2. THE CONTROLLER
@Controller('todos')
export class AppController {
  constructor(
    @InjectRepository(Todo)
    private readonly repo: Repository<Todo>,
  ) { }

  @Post()
  create(@CustomBody('task') task: string) {
    // console.log(task);
    return this.repo.save({ task });
  }

  @Get()
  findAll() {
    return this.repo.find();
  }
}

// 3. THE MODULE
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        // url: configService.get<string>('DATABASE_URL'),
        type: 'mysql', // or 'mariadb'
        host: 'twin-db',
        port: 3306,
        username: dbUsername,
        password: dbPassword,
        database: dbName,

        // Add Todo here   
        entities: [Todo, 
          User, Account, Session, Verification, UploadImage
        ],
        synchronize: true, // Auto-creates table
        dropSchema: false, // Set to false so you don't lose data on every save
      }),
      inject: [ConfigService],
    }),
    // This allows the Repository to be injected into the controller
    TypeOrmModule.forFeature([Todo,]),
    ProfileModule,
    UsersModule,
    MediaModule,
  ],
  controllers: [AppController, HealthController],
})
export class AppModule { }