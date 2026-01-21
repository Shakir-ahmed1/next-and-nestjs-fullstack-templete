import { ApiProperty } from '@nestjs/swagger';

/**
 * Metadata statistics for paginated responses
 */
export class MetaStatsDto {
    
    @ApiProperty({
        description: 'Current page number (1-indexed)',
        example: 1,
    })
    page: number;

    @ApiProperty({
        description: 'Number of items per page',
        example: 20,
    })
    perPage: number;

    @ApiProperty({
        description: 'Number of items skipped',
        example: 0,
    })
    skip: number;
    
    @ApiProperty({
        description: 'Number of items to take',
        example: 20,
    })
    take: number;
    
    @ApiProperty({
        description: 'Total count of items (only present if includeCount=true)',
        required: false,
        example: 100,
    })
    total?: number;
}

/**
 * Helper function to create a paginated response DTO class
 * This is useful for creating type-safe response DTOs in controllers
 * 
 * @example
 * ```typescript
 * class TodoResponseDto {
 *   @ApiProperty() id: number;
 *   @ApiProperty() title: string;
 *   @ApiProperty() task: string;
 * }
 * 
 * const TodoPaginatedResponse = createPaginatedResponseDto(TodoResponseDto);
 * 
 * @ApiResponse({ status: 200, type: TodoPaginatedResponse })
 * findAll() { ... }
 * ```
 */
export function createPaginatedResponseDto<T>(itemClass: new () => T) {
    class PaginatedResponse {
        @ApiProperty({
            description: 'Array of items',
            type: itemClass,
            isArray: true,
        })
        data: T[];

        @ApiProperty({
            description: 'Pagination metadata',
            type: MetaStatsDto,
        })
        metaStats: MetaStatsDto;
    }

    return PaginatedResponse;
}
