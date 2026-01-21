# Swagger Implementation Architecture

## Component Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Swagger UI                               │
│                   http://localhost:3000/api/docs                 │
│                                                                   │
│  Interactive API documentation with:                             │
│  • All endpoints listed by tags                                  │
│  • Try-it-out functionality                                      │
│  • Auto-generated query parameter documentation                  │
│  • Request/Response schemas                                      │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │
                              │ Generated from
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      main.ts (Setup)                             │
│                                                                   │
│  • SwaggerModule.createDocument()                                │
│  • SwaggerModule.setup('/api/docs', ...)                         │
│  • Configuration (title, description, tags, etc.)                │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │
                              │ Scans controllers
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    Controllers Layer                             │
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  @ApiTags('todos')                                    │       │
│  │  @Controller('todos')                                 │       │
│  │  export class TodoController {                        │       │
│  │                                                        │       │
│  │    @Get()                                             │       │
│  │    @ApiOperation({ summary: '...' })                 │       │
│  │    @ApiResponse({ type: PaginatedDto })              │       │
│  │    @ApiQueryOptions({                                │       │
│  │      allowedFields: [...],                           │       │
│  │      fieldTypes: {...},                              │       │
│  │      ...                                              │       │
│  │    })                                                 │       │
│  │    findAll(@Query() query: any) { ... }              │       │
│  │  }                                                    │       │
│  └──────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │
                              │ Uses
                              │
┌─────────────────────────────────────────────────────────────────┐
│                   Decorator Layer                                │
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  @ApiQueryOptions()                                   │       │
│  │  ├─ Generates @ApiQuery() for each field             │       │
│  │  ├─ Generates @ApiQuery() for each operator          │       │
│  │  ├─ Generates @ApiQuery() for pagination             │       │
│  │  ├─ Generates @ApiQuery() for sorting                │       │
│  │  └─ Generates @ApiQuery() for custom params          │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                   │
│  Automatically creates documentation for:                        │
│  • field[equals]=value                                           │
│  • field[not]=value                                              │
│  • field[lt/lte/gt/gte]=value (number/date)                     │
│  • field[contains/icontains/startsWith/endsWith]=value (string) │
│  • field[in/notIn]=value1,value2 (all types)                    │
│  • page, perPage, limit, offset                                  │
│  • sort, orderBy                                                 │
│  • includeCount                                                  │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │
                              │ Uses
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      DTO Layer                                   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  Request DTOs                                         │       │
│  │  ├─ CreateTodoDto                                     │       │
│  │  │  @ApiProperty({ description, example, ... })      │       │
│  │  └─ UpdateTodoDto                                     │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  Response DTOs                                        │       │
│  │  ├─ TodoResponseDto                                   │       │
│  │  │  @ApiProperty({ description, example, ... })      │       │
│  │  ├─ PaginatedResponseDto<T>                          │       │
│  │  └─ createPaginatedResponseDto(ItemDto)              │       │
│  └──────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │
                              │ Matches
                              │
┌─────────────────────────────────────────────────────────────────┐
│                   Service Layer                                  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  findAll(query: any) {                                │       │
│  │    const { typeormQuery, includeCount, metaStats }   │       │
│  │      = buildQueryOptions(                             │       │
│  │          query,                                       │       │
│  │          allowedFields,                               │       │
│  │          { fieldTypes, enumValues, ... }              │       │
│  │        );                                             │       │
│  │                                                        │       │
│  │    return this.repository.findAndCount(typeormQuery); │       │
│  │  }                                                     │       │
│  └──────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │
                              │ Uses
                              │
┌─────────────────────────────────────────────────────────────────┐
│                  Query Builder Library                           │
│                                                                   │
│  buildQueryOptions(query, allowedFields, options)                │
│  ├─ Parses query parameters                                      │
│  ├─ Applies filters with operators                               │
│  ├─ Applies sorting                                              │
│  ├─ Applies pagination                                           │
│  └─ Returns TypeORM-compatible query options                     │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
User Request
    │
    ▼
GET /todos?title[contains]=meeting&sort=-createdAt&page=1&perPage=20
    │
    ▼
┌────────────────────────────────────────┐
│  NestJS Request Pipeline               │
│  • Validation                          │
│  • Parsing                             │
└────────────────────────────────────────┘
    │
    ▼
┌────────────────────────────────────────┐
│  TodoController.findAll()              │
│  • Receives query object               │
│  • Calls service                       │
└────────────────────────────────────────┘
    │
    ▼
┌────────────────────────────────────────┐
│  TodoService.findAll(query)            │
│  • Calls buildQueryOptions()           │
│  • Gets TypeORM query                  │
│  • Executes database query             │
└────────────────────────────────────────┘
    │
    ▼
┌────────────────────────────────────────┐
│  buildQueryOptions()                   │
│  Input:                                │
│    query = {                           │
│      'title[contains]': 'meeting',     │
│      'sort': '-createdAt',             │
│      'page': '1',                      │
│      'perPage': '20'                   │
│    }                                   │
│                                        │
│  Output:                               │
│    {                                   │
│      typeormQuery: {                   │
│        where: {                        │
│          title: Like('%meeting%')      │
│        },                              │
│        order: { createdAt: 'DESC' },   │
│        skip: 0,                        │
│        take: 20                        │
│      },                                │
│      metaStats: { ... },               │
│      includeCount: false               │
│    }                                   │
└────────────────────────────────────────┘
    │
    ▼
┌────────────────────────────────────────┐
│  TypeORM Repository                    │
│  • Executes SQL query                  │
│  • Returns results                     │
└────────────────────────────────────────┘
    │
    ▼
Response: {
  data: [...],
  metaStats: {
    page: 1,
    perPage: 20,
    skip: 0,
    take: 20
  }
}
```

## File Structure

```
backend/
├── src/
│   ├── main.ts                                    # Swagger setup
│   ├── decorators/
│   │   └── api-query-options.decorator.ts        # Main decorator
│   ├── common/
│   │   └── dto/
│   │       └── paginated-response.dto.ts         # Response DTOs
│   ├── lib/
│   │   └── query-builder-typeorm.ts              # Query builder
│   └── todo/
│       ├── todo.controller.ts                    # Controller with Swagger
│       ├── todo.service.ts                       # Service using buildQueryOptions
│       └── dto/
│           ├── create-todo.dto.ts                # Request DTO
│           └── todo-response.dto.ts              # Response DTO
├── docs/
│   ├── SWAGGER_QUERY_OPTIONS.md                  # Detailed guide
│   ├── API_QUERY_OPTIONS_QUICK_REF.md           # Quick reference
│   └── CONTROLLER_TEMPLATE.ts                    # Copy-paste template
├── README_SWAGGER.md                              # Main documentation
└── SWAGGER_IMPLEMENTATION_SUMMARY.md             # This summary
```

## Key Features

### 1. Automatic Operator Documentation
The `@ApiQueryOptions()` decorator automatically generates documentation for all applicable operators based on field type:

- **String fields**: equals, not, contains, icontains, startsWith, endsWith, in, notIn
- **Number/Date fields**: equals, not, lt, lte, gt, gte, in, notIn
- **Boolean fields**: equals, not
- **Enum fields**: equals, not, in, notIn

### 2. Type-Safe Response DTOs
Using `createPaginatedResponseDto(ItemDto)` ensures type safety and consistent response structure:

```typescript
{
  data: ItemDto[],
  total?: number,
  metaStats: {
    page: number,
    perPage: number,
    skip: number,
    take: number
  }
}
```

### 3. Consistency
The decorator configuration mirrors the `buildQueryOptions()` configuration, ensuring documentation matches implementation:

```typescript
// In Controller
@ApiQueryOptions({
  allowedFields: ['id', 'name'],
  fieldTypes: { id: 'number' },
  defaultSort: '-createdAt',
  // ...
})

// In Service
buildQueryOptions(query, ['id', 'name'], {
  fieldTypes: { id: 'number' },
  defaultSort: '-createdAt',
  // ...
})
```

## Benefits

1. **Single Source of Truth**: Configuration in one place
2. **Automatic Documentation**: No manual parameter documentation
3. **Type Safety**: DTOs ensure correct types
4. **Developer Experience**: Interactive Swagger UI
5. **Maintainability**: Easy to update and extend
6. **Discoverability**: All features visible in documentation

## Usage Pattern

```typescript
// 1. Define Response DTO
export class ItemResponseDto {
  @ApiProperty({ ... }) id: number;
  @ApiProperty({ ... }) name: string;
}

// 2. Apply Decorators in Controller
@Get()
@ApiQueryOptions({ allowedFields: ['id', 'name'], ... })
@ApiResponse({ type: createPaginatedResponseDto(ItemResponseDto) })
findAll(@Query() query: any) {
  return this.service.findAll(query);
}

// 3. Use buildQueryOptions in Service
findAll(query: any) {
  const { typeormQuery, ... } = buildQueryOptions(query, ['id', 'name'], { ... });
  return this.repository.find(typeormQuery);
}
```

## Result

✅ Comprehensive, interactive API documentation
✅ Automatic query parameter documentation
✅ Type-safe request/response handling
✅ Consistent behavior across all endpoints
✅ Easy to maintain and extend
