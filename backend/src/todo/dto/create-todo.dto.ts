import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTodoDto {
    @ApiProperty({
        description: 'The title of the todo',
        example: 'Complete project documentation',
        minLength: 1,
        maxLength: 255,
    })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({
        description: 'The task description',
        example: 'Write comprehensive API documentation using Swagger',
        minLength: 1,
    })
    @IsString()
    @IsNotEmpty()
    task: string;
}
