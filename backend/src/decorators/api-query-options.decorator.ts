import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { QueryConfig, QUERY_DEFAULTS } from '../lib/query-builder-typeorm';

/**
 * Configuration for documenting query options in Swagger
 * Inherits from shared QueryConfig and adds Swagger-specific options
 */
export interface ApiQueryOptionsConfig extends QueryConfig {
    /**
     * Additional custom query parameters to document
     */
    customParams?: Array<{
        name: string;
        description: string;
        type?: 'string' | 'number' | 'boolean';
        required?: boolean;
        example?: any;
    }>;
}

/**
 * Available filter operators
 */
const FILTER_OPERATORS = [
    'equals',
    'not',
    'lt',
    'lte',
    'gt',
    'gte',
    'contains',
    'icontains',
    'startsWith',
    'endsWith',
    'in',
    'notIn',
] as const;

/**
 * Decorator to document query options for endpoints using buildQueryOptions()
 * 
 * @example
 * ```typescript
 * @Get()
 * @ApiQueryOptions({
 *   allowedFields: ['id', 'title', 'status', 'createdAt'],
 *   fieldTypes: {
 *     id: 'number',
 *     status: 'enum',
 *     createdAt: 'date',
 *   },
 *   enumValues: {
 *     status: ['pending', 'completed', 'cancelled'],
 *   },
 *   defaultSort: '-createdAt',
 *   defaultPerPage: 20,
 *   maxPerPage: 100,
 *   allowCount: true,
 * })
 * findAll(@Query() query: any) {
 *   return this.service.findAll(query);
 * }
 * ```
 */
export function ApiQueryOptions(config: ApiQueryOptionsConfig) {
    const {
        allowedFields,
        fieldTypes = {},
        enumValues = {},
        defaultSort,
        defaultPerPage = QUERY_DEFAULTS.defaultPerPage,
        maxPerPage = QUERY_DEFAULTS.maxPerPage,
        allowCount = QUERY_DEFAULTS.allowCount,
        customParams = [],
    } = config;

    const decorators: MethodDecorator[] = [];

    // Document pagination parameters
    decorators.push(
        ApiQuery({
            name: 'page',
            required: false,
            type: Number,
            description: 'Page number (1-indexed), (e.g. 1)',
        }),
        ApiQuery({
            name: 'perPage',
            required: false,
            type: Number,
            description: `Items per page (max: ${maxPerPage}, default: ${defaultPerPage}, e.g. 20)`,
        }),
        ApiQuery({
            name: 'limit',
            required: false,
            type: Number,
            description: `Alias for perPage. Items per page (max: ${maxPerPage}, e.g. 20)`,
        }),
        ApiQuery({
            name: 'offset',
            required: false,
            type: Number,
            description: 'Number of items to skip (overrides page), (e.g. 0)',
        })
    );

    // Document sorting
    const sortExample = defaultSort
        ? Array.isArray(defaultSort)
            ? defaultSort.join(',')
            : defaultSort
        : `-${allowedFields[0] || 'id'}`;

    decorators.push(
        ApiQuery({
            name: 'sort',
            required: false,
            type: String,
            description: `Sort order. Prefix with "-" for descending. Comma-separated for multiple fields. Allowed fields: ${allowedFields.join(', ')} (e.g. ${sortExample})`,
        }),
        ApiQuery({
            name: 'orderBy',
            required: false,
            type: String,
            description: 'Alias for sort (e.g. ' + sortExample + ')',
        })
    );

    // Document count parameter
    if (allowCount) {
        decorators.push(
            ApiQuery({
                name: 'includeCount',
                required: false,
                type: Boolean,
                description: 'Include total count in response (e.g. true)',
            })
        );
    }

    // Document filter fields
    for (const field of allowedFields) {
        const fieldType = fieldTypes[field] || 'string';
        const isEnum = fieldType === 'enum';
        const enumVals = isEnum ? enumValues[field] : undefined;

        // Determine the Swagger type
        let swaggerType: any = String;
        let exampleValue: any = 'example';

        if (fieldType === 'number') {
            swaggerType = Number;
            exampleValue = 1;
        } else if (fieldType === 'boolean') {
            swaggerType = Boolean;
            exampleValue = true;
        } else if (fieldType === 'date') {
            swaggerType = String;
            exampleValue = '2024-01-01T00:00:00Z';
        } else if (isEnum && enumVals && enumVals.length > 0) {
            swaggerType = String;
            exampleValue = enumVals[0];
        }

        // Base filter (equals)
        decorators.push(
            ApiQuery({
                name: field,
                required: false,
                type: swaggerType,
                description: isEnum
                    ? `Filter by ${field} (exact match). Allowed values: ${enumVals?.join(', ')}`
                    : `Filter by ${field} (exact match) (e.g. ${exampleValue})`,
            })
        );

        // Add operator-based filters
        const applicableOperators = getApplicableOperators(fieldType);

        for (const op of applicableOperators) {
            const opExample = getOperatorExample(op, fieldType, exampleValue, enumVals);
            decorators.push(
                ApiQuery({
                    name: `${field}[${op}]`,
                    required: false,
                    type: swaggerType,
                    description: getOperatorDescription(op, field, fieldType, enumVals) + ' (e.g. ' + opExample + ')',
                })
            );
        }
    }

    // Document custom parameters
    for (const param of customParams) {
        decorators.push(
            ApiQuery({
                name: param.name,
                required: param.required || false,
                type: param.type === 'number' ? Number : param.type === 'boolean' ? Boolean : String,
                description: param.description + ' (e.g. ' + param.example + ')',
            })
        );
    }

    return applyDecorators(...decorators);
}

/**
 * Get applicable operators for a field type
 */
function getApplicableOperators(
    fieldType: 'string' | 'number' | 'boolean' | 'date' | 'enum'
): string[] {
    switch (fieldType) {
        case 'string':
            return ['not', 'contains', 'icontains', 'startsWith', 'endsWith', 'in', 'notIn'];
        case 'number':
        case 'date':
            return ['not', 'lt', 'lte', 'gt', 'gte', 'in', 'notIn'];
        case 'boolean':
            return ['not'];
        case 'enum':
            return ['not', 'in', 'notIn'];
        default:
            return [];
    }
}

/**
 * Get description for an operator
 */
function getOperatorDescription(
    op: string,
    field: string,
    fieldType: string,
    enumVals?: string[]
): string {
    const enumNote = enumVals ? ` Allowed values: ${enumVals.join(', ')}` : '';

    const descriptions: Record<string, string> = {
        equals: `Filter by ${field} (exact match)${enumNote}`,
        not: `Filter by ${field} (not equal)${enumNote}`,
        lt: `Filter by ${field} (less than)`,
        lte: `Filter by ${field} (less than or equal)`,
        gt: `Filter by ${field} (greater than)`,
        gte: `Filter by ${field} (greater than or equal)`,
        contains: `Filter by ${field} (contains substring, case-sensitive)`,
        icontains: `Filter by ${field} (contains substring, case-insensitive)`,
        startsWith: `Filter by ${field} (starts with)`,
        endsWith: `Filter by ${field} (ends with)`,
        in: `Filter by ${field} (in list, comma-separated)${enumNote}`,
        notIn: `Filter by ${field} (not in list, comma-separated)${enumNote}`,
    };

    return descriptions[op] || `Filter by ${field} using ${op} operator`;
}

/**
 * Get example value for an operator
 */
function getOperatorExample(
    op: string,
    fieldType: string,
    baseExample: any,
    enumVals?: string[]
): any {
    if (op === 'in' || op === 'notIn') {
        if (fieldType === 'enum' && enumVals && enumVals.length > 1) {
            return `${enumVals[0]},${enumVals[1]}`;
        }
        if (fieldType === 'number') {
            return '1,2,3';
        }
        if (fieldType === 'string') {
            return 'value1,value2';
        }
    }

    if (fieldType === 'number') {
        if (op === 'lt' || op === 'lte') return 100;
        if (op === 'gt' || op === 'gte') return 0;
    }

    if (fieldType === 'date') {
        if (op === 'lt' || op === 'lte') return '2024-12-31T23:59:59Z';
        if (op === 'gt' || op === 'gte') return '2024-01-01T00:00:00Z';
    }

    return baseExample;
}
