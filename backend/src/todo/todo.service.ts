import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from './entities/todo.entity';
import { buildQueryOptions } from '../lib/query-builder-typeorm';
import { TODO_QUERY_CONFIG } from './todo.config';

@Injectable()
export class TodoService {
    private readonly logger = new Logger(TodoService.name);

    constructor(
        @InjectRepository(Todo)
        private readonly todoRepository: Repository<Todo>,
    ) { }

    create(title: string, task: string) {
        this.logger.log(`Creating new todo: "${title}"`);
        return this.todoRepository.save({ title, task });
    }


    async findAll(query: any) {
        const { typeormQuery, includeCount, metaStats } = buildQueryOptions(query, TODO_QUERY_CONFIG);

        if (includeCount) {
            const [data, total] = await this.todoRepository.findAndCount(typeormQuery);
            return { data, metaStats: { ...metaStats, total } };
        } else {
            const data = await this.todoRepository.find(typeormQuery);
            return { data, metaStats };
        }
    }
}
