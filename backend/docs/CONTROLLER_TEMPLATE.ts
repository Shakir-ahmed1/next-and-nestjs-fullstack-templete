// /**
//  * TEMPLATE: Controller with Swagger Documentation
//  * 
//  * This template shows how to create a fully documented controller
//  * with endpoints that use buildQueryOptions().
//  * 
//  * Replace:
//  * - YourEntity with your entity name (e.g., Product, User, Order)
//  * - your-entity with kebab-case version (e.g., product, user, order)
//  * - Customize fields, types, and options as needed
//  */

// import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
// import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
// import { ApiQueryOptions } from '../decorators/api-query-options.decorator';
// import { createPaginatedResponseDto } from '../common/dto/paginated-response.dto';
// import { YourEntityService } from './your-entity.service';
// import { CreateYourEntityDto } from './dto/create-your-entity.dto';
// import { UpdateYourEntityDto } from './dto/update-your-entity.dto';
// import { YourEntityResponseDto } from './dto/your-entity-response.dto';

// @ApiTags('your-entity')
// @Controller('your-entity')
// export class YourEntityController {
//     constructor(private readonly yourEntityService: YourEntityService) { }

//     // ============================================================================
//     // CREATE
//     // ============================================================================
//     @Post()
//     @ApiOperation({
//         summary: 'Create a new YourEntity',
//         description: 'Creates a new YourEntity with the provided data'
//     })
//     @ApiResponse({
//         status: 201,
//         description: 'YourEntity created successfully',
//         type: YourEntityResponseDto,
//     })
//     @ApiResponse({ status: 400, description: 'Invalid input data' })
//     @ApiBody({ type: CreateYourEntityDto })
//     create(@Body() createDto: CreateYourEntityDto) {
//         return this.yourEntityService.create(createDto);
//     }

//     // ============================================================================
//     // READ ALL (with filtering, sorting, pagination)
//     // ============================================================================
//     @Get()
//     @ApiOperation({
//         summary: 'Get all YourEntity items',
//         description: `
// Retrieve YourEntity items with advanced query capabilities:

// **Filtering:**
// - Use field names directly for exact matches: \`?name=Example\`
// - Use operators for advanced filtering: \`?id[gte]=5\`, \`?name[contains]=search\`
// - Multiple values for OR logic: \`?status[in]=active,pending\`

// **Available Operators:**
// - \`equals\`: Exact match (default)
// - \`not\`: Not equal
// - \`lt\`, \`lte\`: Less than, less than or equal
// - \`gt\`, \`gte\`: Greater than, greater than or equal
// - \`contains\`: Case-sensitive substring match
// - \`icontains\`: Case-insensitive substring match
// - \`startsWith\`, \`endsWith\`: String prefix/suffix match
// - \`in\`, \`notIn\`: Match/exclude from comma-separated list

// **Sorting:**
// - Use \`sort\` or \`orderBy\`: \`?sort=name\` (ascending) or \`?sort=-createdAt\` (descending)
// - Multiple fields: \`?sort=-createdAt,name\`

// **Pagination:**
// - \`page\`: Page number (1-indexed)
// - \`perPage\` or \`limit\`: Items per page (default: 20, max: 100)
// - \`offset\`: Skip items (overrides page)
// - \`includeCount\`: Set to true to include total count

// **Examples:**
// - Get active items: \`?status=active\`
// - Get recent items: \`?sort=-createdAt&perPage=10\`
// - Search by name: \`?name[icontains]=search\`
// - Date range: \`?createdAt[gte]=2024-01-01&createdAt[lte]=2024-12-31\`
// - Complex: \`?status=active&price[gte]=100&sort=-createdAt&page=1&perPage=20&includeCount=true\`
//         `
//     })
//     @ApiResponse({
//         status: 200,
//         description: 'List of YourEntity items with metadata',
//         type: createPaginatedResponseDto(YourEntityResponseDto),
//     })
//     @ApiQueryOptions({
//         // TODO: Customize these fields based on your entity
//         allowedFields: [
//             'id',
//             'name',
//             'description',
//             'status',
//             'price',
//             'quantity',
//             'isActive',
//             'createdAt',
//             'updatedAt',
//         ],
//         fieldTypes: {
//             // Numbers
//             id: 'number',
//             price: 'number',
//             quantity: 'number',

//             // Strings (default, can be omitted)
//             name: 'string',
//             description: 'string',

//             // Enums
//             status: 'enum',

//             // Booleans
//             isActive: 'boolean',

//             // Dates
//             createdAt: 'date',
//             updatedAt: 'date',
//         },
//         enumValues: {
//             // TODO: Customize enum values
//             status: ['draft', 'active', 'archived'],
//         },
//         defaultSort: '-createdAt',
//         defaultPerPage: 20,
//         maxPerPage: 100,
//         allowCount: true,

//         // Optional: Add custom parameters
//         // customParams: [
//         //     {
//         //         name: 'search',
//         //         description: 'Full-text search across multiple fields',
//         //         type: 'string',
//         //         required: false,
//         //         example: 'search term',
//         //     },
//         // ],
//     })
//     findAll(@Query() query: any) {
//         return this.yourEntityService.findAll(query);
//     }

//     // ============================================================================
//     // READ ONE
//     // ============================================================================
//     @Get(':id')
//     @ApiOperation({
//         summary: 'Get a YourEntity by ID',
//         description: 'Retrieves a single YourEntity by its unique identifier'
//     })
//     @ApiParam({
//         name: 'id',
//         type: Number,
//         description: 'YourEntity ID',
//         example: 1,
//     })
//     @ApiResponse({
//         status: 200,
//         description: 'YourEntity found',
//         type: YourEntityResponseDto,
//     })
//     @ApiResponse({ status: 404, description: 'YourEntity not found' })
//     findOne(@Param('id', ParseIntPipe) id: number) {
//         return this.yourEntityService.findOne(id);
//     }

//     // ============================================================================
//     // UPDATE
//     // ============================================================================
//     @Put(':id')
//     @ApiOperation({
//         summary: 'Update a YourEntity',
//         description: 'Updates an existing YourEntity with the provided data'
//     })
//     @ApiParam({
//         name: 'id',
//         type: Number,
//         description: 'YourEntity ID',
//         example: 1,
//     })
//     @ApiResponse({
//         status: 200,
//         description: 'YourEntity updated successfully',
//         type: YourEntityResponseDto,
//     })
//     @ApiResponse({ status: 404, description: 'YourEntity not found' })
//     @ApiResponse({ status: 400, description: 'Invalid input data' })
//     @ApiBody({ type: UpdateYourEntityDto })
//     update(
//         @Param('id', ParseIntPipe) id: number,
//         @Body() updateDto: UpdateYourEntityDto
//     ) {
//         return this.yourEntityService.update(id, updateDto);
//     }

//     // ============================================================================
//     // DELETE
//     // ============================================================================
//     @Delete(':id')
//     @ApiOperation({
//         summary: 'Delete a YourEntity',
//         description: 'Permanently deletes a YourEntity'
//     })
//     @ApiParam({
//         name: 'id',
//         type: Number,
//         description: 'YourEntity ID',
//         example: 1,
//     })
//     @ApiResponse({
//         status: 200,
//         description: 'YourEntity deleted successfully',
//         schema: {
//             type: 'object',
//             properties: {
//                 message: { type: 'string', example: 'YourEntity deleted successfully' },
//                 id: { type: 'number', example: 1 },
//             }
//         }
//     })
//     @ApiResponse({ status: 404, description: 'YourEntity not found' })
//     remove(@Param('id', ParseIntPipe) id: number) {
//         return this.yourEntityService.remove(id);
//     }
// }

// /**
//  * TEMPLATE: Response DTO
//  * 
//  * Create this in: ./dto/your-entity-response.dto.ts
//  */
// /*
// import { ApiProperty } from '@nestjs/swagger';

// export class YourEntityResponseDto {
//     @ApiProperty({
//         description: 'Unique identifier',
//         example: 1,
//     })
//     id: number;

//     @ApiProperty({
//         description: 'Name of the entity',
//         example: 'Example Name',
//     })
//     name: string;

//     @ApiProperty({
//         description: 'Description',
//         example: 'This is an example description',
//         required: false,
//     })
//     description?: string;

//     @ApiProperty({
//         description: 'Status',
//         enum: ['draft', 'active', 'archived'],
//         example: 'active',
//     })
//     status: string;

//     @ApiProperty({
//         description: 'Price',
//         example: 99.99,
//         required: false,
//     })
//     price?: number;

//     @ApiProperty({
//         description: 'Is active',
//         example: true,
//     })
//     isActive: boolean;

//     @ApiProperty({
//         description: 'Creation timestamp',
//         example: '2024-01-01T00:00:00.000Z',
//         type: String,
//         format: 'date-time',
//     })
//     createdAt: Date;

//     @ApiProperty({
//         description: 'Last update timestamp',
//         example: '2024-01-01T00:00:00.000Z',
//         type: String,
//         format: 'date-time',
//     })
//     updatedAt: Date;
// }
// */

// /**
//  * TEMPLATE: Create DTO
//  * 
//  * Create this in: ./dto/create-your-entity.dto.ts
//  */
// /*
// import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsEnum } from 'class-validator';
// import { ApiProperty } from '@nestjs/swagger';

// enum Status {
//     DRAFT = 'draft',
//     ACTIVE = 'active',
//     ARCHIVED = 'archived',
// }

// export class CreateYourEntityDto {
//     @ApiProperty({
//         description: 'Name of the entity',
//         example: 'Example Name',
//         minLength: 1,
//         maxLength: 255,
//     })
//     @IsString()
//     @IsNotEmpty()
//     name: string;

//     @ApiProperty({
//         description: 'Description',
//         example: 'This is an example description',
//         required: false,
//     })
//     @IsString()
//     @IsOptional()
//     description?: string;

//     @ApiProperty({
//         description: 'Status',
//         enum: Status,
//         example: Status.DRAFT,
//         default: Status.DRAFT,
//     })
//     @IsEnum(Status)
//     @IsOptional()
//     status?: Status;

//     @ApiProperty({
//         description: 'Price',
//         example: 99.99,
//         minimum: 0,
//         required: false,
//     })
//     @IsNumber()
//     @IsOptional()
//     price?: number;

//     @ApiProperty({
//         description: 'Is active',
//         example: true,
//         default: true,
//     })
//     @IsBoolean()
//     @IsOptional()
//     isActive?: boolean;
// }
// */

// /**
//  * TEMPLATE: Update DTO
//  * 
//  * Create this in: ./dto/update-your-entity.dto.ts
//  */
// /*
// import { PartialType } from '@nestjs/swagger';
// import { CreateYourEntityDto } from './create-your-entity.dto';

// export class UpdateYourEntityDto extends PartialType(CreateYourEntityDto) {}
// */

// /**
//  * TEMPLATE: Service Implementation
//  * 
//  * Add this to your service file
//  */
// /*
// async findAll(query: any) {
//     const { typeormQuery, includeCount, metaStats } = buildQueryOptions(
//         query,
//         ['id', 'name', 'description', 'status', 'price', 'quantity', 'isActive', 'createdAt', 'updatedAt'],
//         {
//             fieldTypes: {
//                 id: 'number',
//                 price: 'number',
//                 quantity: 'number',
//                 status: 'enum',
//                 isActive: 'boolean',
//                 createdAt: 'date',
//                 updatedAt: 'date',
//             },
//             enumValues: {
//                 status: ['draft', 'active', 'archived'],
//             },
//             defaultSort: '-createdAt',
//             defaultPerPage: 20,
//             maxPerPage: 100,
//             allowCount: true,
//         }
//     );

//     if (includeCount) {
//         const [data, total] = await this.repository.findAndCount(typeormQuery);
//         return { data, metaStats: { ...metaStats, total } };
//     } else {
//         const data = await this.repository.find(typeormQuery);
//         return { data, metaStats };
//     }
// }
// */
