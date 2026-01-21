# Swagger Documentation for buildQueryOptions()

This guide explains how to document endpoints that use `buildQueryOptions()` with Swagger/OpenAPI.

## Overview

The `@ApiQueryOptions()` decorator automatically generates comprehensive Swagger documentation for endpoints that use the `buildQueryOptions()` function. It documents all available filters, operators, pagination, and sorting options.

## Quick Start

### 1. Import the Decorator

```typescript
import { ApiQueryOptions } from '../decorators/api-query-options.decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
```

### 2. Apply to Your Controller Method

```typescript
@Get()
@ApiOperation({ 
    summary: 'Get all items',
    description: 'Retrieve items with filtering, sorting, and pagination'
})
@ApiQueryOptions({
    allowedFields: ['id', 'name', 'status', 'createdAt'],
    fieldTypes: {
        id: 'number',
        status: 'enum',
        createdAt: 'date',
    },
    enumValues: {
        status: ['pending', 'active', 'completed', 'cancelled'],
    },
    defaultSort: '-createdAt',
    defaultPerPage: 20,
    maxPerPage: 100,
    allowCount: true,
})
findAll(@Query() query: any) {
    return this.service.findAll(query);
}
```

## Configuration Options

### ApiQueryOptionsConfig

| Property | Type | Description | Required |
|----------|------|-------------|----------|
| `allowedFields` | `string[]` | Fields that can be filtered and sorted | ✅ Yes |
| `fieldTypes` | `Record<string, FieldType>` | Type mapping for each field | ❌ No |
| `enumValues` | `Record<string, string[]>` | Valid values for enum fields | ❌ No |
| `defaultSort` | `string \| string[]` | Default sort order (e.g., "-createdAt") | ❌ No |
| `defaultPerPage` | `number` | Default items per page | ❌ No (default: 20) |
| `maxPerPage` | `number` | Maximum items per page | ❌ No (default: 100) |
| `allowCount` | `boolean` | Whether to allow count queries | ❌ No (default: false) |
| `customParams` | `CustomParam[]` | Additional custom query parameters | ❌ No |

### Field Types

- `'string'` - Text fields (supports contains, startsWith, etc.)
- `'number'` - Numeric fields (supports lt, gt, etc.)
- `'boolean'` - Boolean fields (supports equals, not)
- `'date'` - Date/timestamp fields (supports lt, gt, etc.)
- `'enum'` - Enumeration fields (supports in, notIn)

## Supported Operators by Field Type

### String Fields
- `equals` - Exact match (default)
- `not` - Not equal
- `contains` - Case-sensitive substring
- `icontains` - Case-insensitive substring
- `startsWith` - Starts with prefix
- `endsWith` - Ends with suffix
- `in` - Match any in comma-separated list
- `notIn` - Exclude from comma-separated list

### Number & Date Fields
- `equals` - Exact match (default)
- `not` - Not equal
- `lt` - Less than
- `lte` - Less than or equal
- `gt` - Greater than
- `gte` - Greater than or equal
- `in` - Match any in comma-separated list
- `notIn` - Exclude from comma-separated list

### Boolean Fields
- `equals` - Exact match (default)
- `not` - Not equal

### Enum Fields
- `equals` - Exact match (default)
- `not` - Not equal
- `in` - Match any in comma-separated list
- `notIn` - Exclude from comma-separated list

## Complete Example

Here's a complete example for a Product controller:

```typescript
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiQueryOptions } from '../decorators/api-query-options.decorator';
import { ProductService } from './product.service';

@ApiTags('products')
@Controller('products')
export class ProductController {
    constructor(private readonly productService: ProductService) {}

    @Get()
    @ApiOperation({ 
        summary: 'Get all products',
        description: 'Retrieve products with advanced filtering, sorting, and pagination'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'List of products',
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'number' },
                            name: { type: 'string' },
                            price: { type: 'number' },
                            status: { type: 'string', enum: ['draft', 'published', 'archived'] },
                            inStock: { type: 'boolean' },
                            createdAt: { type: 'string', format: 'date-time' },
                        }
                    }
                },
                metaStats: {
                    type: 'object',
                    properties: {
                        total: { type: 'number' },
                        page: { type: 'number' },
                        perPage: { type: 'number' },
                        skip: { type: 'number' },
                        take: { type: 'number' },
                    }
                }
            }
        }
    })
    @ApiQueryOptions({
        allowedFields: ['id', 'name', 'price', 'status', 'inStock', 'createdAt', 'updatedAt'],
        fieldTypes: {
            id: 'number',
            name: 'string',
            price: 'number',
            status: 'enum',
            inStock: 'boolean',
            createdAt: 'date',
            updatedAt: 'date',
        },
        enumValues: {
            status: ['draft', 'published', 'archived'],
        },
        defaultSort: '-createdAt',
        defaultPerPage: 20,
        maxPerPage: 100,
        allowCount: true,
    })
    findAll(@Query() query: any) {
        const { typeormQuery, includeCount, metaStats } = buildQueryOptions(
            query,
            ['id', 'name', 'price', 'status', 'inStock', 'createdAt', 'updatedAt'],
            {
                fieldTypes: {
                    id: 'number',
                    price: 'number',
                    status: 'enum',
                    inStock: 'boolean',
                    createdAt: 'date',
                    updatedAt: 'date',
                },
                enumValues: {
                    status: ['draft', 'published', 'archived'],
                },
                defaultSort: '-createdAt',
                defaultPerPage: 20,
                maxPerPage: 100,
                allowCount: true,
            }
        );

        return this.productService.findAll(typeormQuery, includeCount, metaStats);
    }
}
```

## Query Examples

Once documented, users can use these query patterns:

### Basic Filtering
```
GET /products?status=published
GET /products?inStock=true
GET /products?name=Laptop
```

### Advanced Filtering
```
GET /products?price[gte]=100&price[lte]=500
GET /products?name[icontains]=phone
GET /products?status[in]=published,draft
GET /products?createdAt[gte]=2024-01-01T00:00:00Z
```

### Sorting
```
GET /products?sort=name
GET /products?sort=-price
GET /products?sort=-createdAt,name
```

### Pagination
```
GET /products?page=2&perPage=50
GET /products?limit=10
GET /products?offset=20&limit=10
```

### Combined Queries
```
GET /products?status=published&price[gte]=100&sort=-createdAt&page=1&perPage=20&includeCount=true
```

## Custom Parameters

You can also document additional custom parameters:

```typescript
@ApiQueryOptions({
    allowedFields: ['id', 'name'],
    customParams: [
        {
            name: 'search',
            description: 'Full-text search across multiple fields',
            type: 'string',
            required: false,
            example: 'laptop computer',
        },
        {
            name: 'categoryId',
            description: 'Filter by category ID',
            type: 'number',
            required: false,
            example: 5,
        },
    ],
})
```

## Best Practices

1. **Keep allowedFields in sync**: Ensure the `allowedFields` in `@ApiQueryOptions()` matches the fields passed to `buildQueryOptions()` in your service.

2. **Document field types**: Always specify `fieldTypes` for non-string fields to get accurate operator documentation.

3. **Provide enum values**: For enum fields, always provide `enumValues` to show users valid options.

4. **Set reasonable limits**: Configure `maxPerPage` to prevent excessive data retrieval.

5. **Use descriptive operation summaries**: Add clear `@ApiOperation()` descriptions to help users understand the endpoint.

6. **Document response schemas**: Use `@ApiResponse()` to show the expected response structure.

## Accessing Swagger UI

After implementing, access your API documentation at:
```
http://localhost:3000/api/docs
```

The Swagger UI will show all available query parameters with descriptions, examples, and allowed values.

## Tips

- The decorator automatically generates documentation for all operators applicable to each field type
- Pagination parameters (page, perPage, limit, offset) are always documented
- Sorting parameters (sort, orderBy) are documented with examples
- The includeCount parameter is only documented if `allowCount: true`
- All query parameters are marked as optional in Swagger
