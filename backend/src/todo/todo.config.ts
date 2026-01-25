import { QueryConfig } from '../lib/query-builder-typeorm';

export const TODO_QUERY_CONFIG: QueryConfig = {
    allowedFields: ['id', 'title', 'task', 'createdAt', 'updatedAt'],
    fieldTypes: {
        id: 'number',
        title: 'string',
        task: 'string',
        createdAt: 'date',
        updatedAt: 'date',
    },
    defaultSort: '-createdAt',
    defaultPerPage: 20,
    maxPerPage: 100,
    allowCount: true,
};
