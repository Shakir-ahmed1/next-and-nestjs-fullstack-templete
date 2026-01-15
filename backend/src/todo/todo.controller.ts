import { Controller, Get, Post, Body } from '@nestjs/common';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';

@Controller('todos')
export class TodoController {
    constructor(private readonly todoService: TodoService) { }

    @Post()
    create(@Body() createTodoDto: CreateTodoDto) {
        return this.todoService.create(createTodoDto.task);
    }

    @Get()
    findAll() {
        return this.todoService.findAll();
    }
}
