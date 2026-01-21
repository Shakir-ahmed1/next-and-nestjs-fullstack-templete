import { ApiProperty } from '@nestjs/swagger';

export class TodoResponseDto {
    @ApiProperty({
        description: 'Unique identifier',
        example: 1,
    })
    id: number;

    @ApiProperty({
        description: 'Todo title',
        example: 'Complete project documentation',
    })
    title: string;

    @ApiProperty({
        description: 'Todo task description',
        example: 'Write comprehensive API documentation using Swagger',
    })
    task: string;

    @ApiProperty({
        description: 'Creation timestamp',
        example: '2024-01-01T00:00:00.000Z',
        type: String,
        format: 'date-time',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Last update timestamp',
        example: '2024-01-01T00:00:00.000Z',
        type: String,
        format: 'date-time',
    })
    updatedAt: Date;
}
