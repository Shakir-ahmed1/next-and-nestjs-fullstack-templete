import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from './entities/todo.entity';
import { buildQueryOptions } from '../lib/query-builder-typeorm';

@Injectable()
export class TodoService {
    constructor(
        @InjectRepository(Todo)
        private readonly todoRepository: Repository<Todo>,
    ) { }

    create(title: string, task: string) {
        return this.todoRepository.save({ title, task });
    }

    async findAll(query: any) {
        const { typeormQuery, includeCount, metaStats } = buildQueryOptions(query, ['id', 'title', 'task', 'createdAt', 'updatedAt'], {
            fieldTypes: {
                id: 'number',
                createdAt: 'date',
                updatedAt: 'date',
            },
            defaultSort: '-createdAt'
        });

        if (includeCount) {
            const [data, total] = await this.todoRepository.findAndCount(typeormQuery);
            return { data, total, metaStats };
        }

        return this.todoRepository.find(typeormQuery);
    }
}
