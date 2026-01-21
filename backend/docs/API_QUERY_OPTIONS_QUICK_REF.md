# Quick Reference: @ApiQueryOptions Decorator

## Basic Usage

```typescript
@Get()
@ApiQueryOptions({
    allowedFields: ['id', 'name', 'status', 'createdAt'],
    fieldTypes: {
        id: 'number',
        status: 'enum',
        createdAt: 'date',
    },
    enumValues: {
        status: ['active', 'inactive'],
    },
    defaultSort: '-createdAt',
    defaultPerPage: 20,
    maxPerPage: 100,
    allowCount: true,
})
findAll(@Query() query: any) { ... }
```

## Field Types & Operators

| Field Type | Operators | Example |
|------------|-----------|---------|
| `string` | equals, not, contains, icontains, startsWith, endsWith, in, notIn | `?name[contains]=John` |
| `number` | equals, not, lt, lte, gt, gte, in, notIn | `?price[gte]=100` |
| `date` | equals, not, lt, lte, gt, gte, in, notIn | `?createdAt[gte]=2024-01-01` |
| `boolean` | equals, not | `?active=true` |
| `enum` | equals, not, in, notIn | `?status[in]=active,pending` |

## Common Patterns

### String Search
```typescript
fieldTypes: { name: 'string' }
// Query: ?name[icontains]=search
```

### Number Range
```typescript
fieldTypes: { price: 'number' }
// Query: ?price[gte]=10&price[lte]=100
```

### Date Range
```typescript
fieldTypes: { createdAt: 'date' }
// Query: ?createdAt[gte]=2024-01-01&createdAt[lte]=2024-12-31
```

### Enum Filter
```typescript
fieldTypes: { status: 'enum' },
enumValues: { status: ['active', 'inactive', 'pending'] }
// Query: ?status[in]=active,pending
```

### Multiple Filters
```typescript
// Query: ?status=active&price[gte]=100&name[contains]=product&sort=-createdAt
```

## Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `allowedFields` | `string[]` | ✅ Yes | - | Fields that can be filtered/sorted |
| `fieldTypes` | `Record<string, FieldType>` | ❌ No | `{}` | Type for each field |
| `enumValues` | `Record<string, string[]>` | ❌ No | `{}` | Valid values for enum fields |
| `defaultSort` | `string \| string[]` | ❌ No | - | Default sort order |
| `defaultPerPage` | `number` | ❌ No | `20` | Default items per page |
| `maxPerPage` | `number` | ❌ No | `100` | Maximum items per page |
| `allowCount` | `boolean` | ❌ No | `false` | Allow total count queries |
| `customParams` | `CustomParam[]` | ❌ No | `[]` | Additional custom parameters |

## Standard Query Parameters

Always documented automatically:

- `page` - Page number (1-indexed)
- `perPage` / `limit` - Items per page
- `offset` - Skip items
- `sort` / `orderBy` - Sort order (prefix with `-` for DESC)
- `includeCount` - Include total count (if `allowCount: true`)

## Complete Example

```typescript
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiQueryOptions } from '../decorators/api-query-options.decorator';
import { createPaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { ProductResponseDto } from './dto/product-response.dto';

@ApiTags('products')
@Controller('products')
export class ProductController {
    @Get()
    @ApiOperation({ summary: 'Get all products' })
    @ApiResponse({ 
        status: 200, 
        type: createPaginatedResponseDto(ProductResponseDto) 
    })
    @ApiQueryOptions({
        allowedFields: ['id', 'name', 'price', 'category', 'inStock', 'createdAt'],
        fieldTypes: {
            id: 'number',
            price: 'number',
            category: 'enum',
            inStock: 'boolean',
            createdAt: 'date',
        },
        enumValues: {
            category: ['electronics', 'clothing', 'food'],
        },
        defaultSort: '-createdAt',
        defaultPerPage: 20,
        maxPerPage: 100,
        allowCount: true,
    })
    findAll(@Query() query: any) {
        const { typeormQuery, includeCount, metaStats } = buildQueryOptions(
            query,
            ['id', 'name', 'price', 'category', 'inStock', 'createdAt'],
            {
                fieldTypes: {
                    id: 'number',
                    price: 'number',
                    category: 'enum',
                    inStock: 'boolean',
                    createdAt: 'date',
                },
                enumValues: {
                    category: ['electronics', 'clothing', 'food'],
                },
                defaultSort: '-createdAt',
                defaultPerPage: 20,
                maxPerPage: 100,
                allowCount: true,
            }
        );
        
        return this.service.findAll(typeormQuery, includeCount, metaStats);
    }
}
```

## Tips

✅ **DO:**
- Keep `allowedFields` in sync with `buildQueryOptions()`
- Specify `fieldTypes` for non-string fields
- Provide `enumValues` for enum fields
- Set reasonable `maxPerPage` limits

❌ **DON'T:**
- Forget to import `@ApiQueryOptions`
- Mix up field types (e.g., marking a number as string)
- Allow unlimited `perPage` values
- Expose sensitive fields in `allowedFields`

## Access Swagger UI

```
http://localhost:3000/api/docs
```

## Need Help?

See full documentation:
- [README_SWAGGER.md](./README_SWAGGER.md)
- [SWAGGER_QUERY_OPTIONS.md](./docs/SWAGGER_QUERY_OPTIONS.md)
