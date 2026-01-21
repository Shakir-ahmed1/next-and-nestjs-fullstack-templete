import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { TodoResponseDto } from './dto/todo-response.dto';
import { ApiQueryOptions } from '../decorators/api-query-options.decorator';
import { createPaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { Todo } from './entities/todo.entity';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';

@ApiTags('todos')
@Controller('todos')
@AllowAnonymous()
export class TodoController {
    constructor(private readonly todoService: TodoService) { }

    @Post()
    @ApiOperation({
        summary: 'Create a new todo',
        description: 'Creates a new todo item with a title and task description'
    })
    @ApiResponse({
        status: 201,
        description: 'Todo created successfully',
        type: TodoResponseDto,
    })
    @ApiResponse({ status: 400, description: 'Invalid input' })
    @ApiBody({ type: CreateTodoDto })
    create(@Body() createTodoDto: CreateTodoDto) {
        return this.todoService.create(createTodoDto.title, createTodoDto.task);
    }

    @Get()
    @ApiOperation({
        summary: 'Get all todos with filtering, sorting, and pagination',
        description: `
Retrieve todos with advanced query capabilities:

**Filtering:**
- Use field names directly for exact matches: \`?title=My Todo\`
- Use operators for advanced filtering: \`?id[gte]=5\`, \`?title[contains]=important\`
- Multiple values for OR logic: \`?id=1&id=2\` or \`?id[in]=1,2,3\`

**Available Operators:**
- \`equals\`: Exact match (default)
- \`not\`: Not equal
- \`lt\`, \`lte\`: Less than, less than or equal
- \`gt\`, \`gte\`: Greater than, greater than or equal
- \`contains\`: Case-sensitive substring match
- \`icontains\`: Case-insensitive substring match
- \`startsWith\`, \`endsWith\`: String prefix/suffix match
- \`in\`, \`notIn\`: Match/exclude from comma-separated list

**Sorting:**
- Use \`sort\` or \`orderBy\`: \`?sort=title\` (ascending) or \`?sort=-createdAt\` (descending)
- Multiple fields: \`?sort=-createdAt,title\`

**Pagination:**
- \`page\`: Page number (1-indexed)
- \`perPage\` or \`limit\`: Items per page (default: 20, max: 100)
- \`offset\`: Skip items (overrides page)
- \`includeCount\`: Set to true to include total count

**Examples:**
- Get completed todos: \`?status=completed\`
- Get recent todos: \`?sort=-createdAt&perPage=10\`
- Search by title: \`?title[icontains]=meeting\`
- Get todos created after date: \`?createdAt[gte]=2024-01-01T00:00:00Z\`
- Complex query: \`?title[contains]=urgent&sort=-createdAt&page=1&perPage=20&includeCount=true\`
        `
    })
    @ApiResponse({
        status: 200,
        description: 'List of todos with metadata',
        type: createPaginatedResponseDto<Todo>(TodoResponseDto),
    })
    @ApiQueryOptions({
        allowedFields: ['id', 'title', 'task', 'createdAt', 'updatedAt'],
        fieldTypes: {
            id: 'number',
            title: 'string',
            task: 'string',
            createdAt: 'date',
            updatedAt: 'date',
        },
        defaultSort: '-createdAt',
        defaultPerPage: 20,
        maxPerPage: 100,
        allowCount: true,
    })
    findAll(@Query() query: any) {
        return this.todoService.findAll(query);
    }
}
