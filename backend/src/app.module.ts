import { Module, Controller, Get, Post, Body } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, InjectRepository } from '@nestjs/typeorm';
import { Entity, PrimaryGeneratedColumn, Column, Repository } from 'typeorm';

// 1. THE ENTITY
@Entity()
export class Todo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({default: 'abcd'})
  task: string;
}

// 2. THE CONTROLLER
@Controller('todos')
export class AppController {
  constructor(
    @InjectRepository(Todo)
    private readonly repo: Repository<Todo>,
  ) {}

  @Post()
  create(@Body('task') task: string) {
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
        type: 'mysql',
        url: configService.get<string>('DATABASE_URL'),
        // Add Todo here 
        entities: [Todo], 
        synchronize: true, // Auto-creates table
        dropSchema: false, // Set to false so you don't lose data on every save
      }),
      inject: [ConfigService],
    }),
    // This allows the Repository to be injected into the controller
    TypeOrmModule.forFeature([Todo]),
  ],
  controllers: [AppController],
})
export class AppModule {}