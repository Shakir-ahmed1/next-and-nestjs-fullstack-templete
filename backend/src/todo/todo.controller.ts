import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';

@Controller('todos')

export class TodoController {
    constructor(private readonly todoService: TodoService) { }

    @Post()
    create(@Body() createTodoDto: CreateTodoDto) {
        return this.todoService.create(createTodoDto.title, createTodoDto.task);
    }

    @Get()
    findAll(@Query() query: any) {
        return this.todoService.findAll(query);
    }
}
