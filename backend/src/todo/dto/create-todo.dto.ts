import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTodoDto {
    @IsString()
    @IsNotEmpty()
    task: string;
}
