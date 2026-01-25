
import {
    Equal,
    ILike,
    In,
    LessThan,
    LessThanOrEqual,
    Like,
    MoreThan,
    MoreThanOrEqual,
    Not,
    FindOptionsWhere,
    FindManyOptions
} from "typeorm";

export type FieldType = "string" | "number" | "boolean" | "date" | "enum";

/**
 * Shared configuration for buildQueryOptions and ApiQueryOptions
 */
export interface QueryConfig {
    /**
     * Fields that are allowed to be used in filters/sort
     */
    allowedFields: string[];
    /**
     * Field types for proper documentation and casting
     */
    fieldTypes?: Record<string, FieldType>;
    /**
     * Default items per page
     */
    defaultPerPage?: number;
    /**
     * Maximum items per page
     */
    maxPerPage?: number;
    /**
     * Default sort order (e.g. "-createdAt" or ["-createdAt","id"])
     */
    defaultSort?: string | string[];
    /**
     * Whether to allow includeCount parameter. Default is true.
     */
    allowCount?: boolean;
    /**
     * Available values for enum fields
     */
    enumValues?: Record<string, string[]>;
}

export const QUERY_DEFAULTS: Partial<QueryConfig> = {
    defaultPerPage: 20,
    maxPerPage: 100,
    allowCount: true,
};

// helper: cast string to a field type
function castValue(val: string, type: FieldType, enumValues?: string[]) {
    if (type === "number") {
        const n = Number(val);
        if (Number.isNaN(n)) throw new Error(`Invalid number: ${val}`);
        return n;
    }
    if (type === "boolean") {
        if (val === "true" || val === "1") return true;
        if (val === "false" || val === "0") return false;
        throw new Error(`Invalid boolean: ${val}`);
    }
    if (type === "date") {
        const d = new Date(val);
        if (Number.isNaN(d.valueOf())) throw new Error(`Invalid date: ${val}`);
        return d;
    }
    if (type === "enum" && enumValues) {
        if (!enumValues.includes(val)) return undefined; // Skip invalid enum values
        return val;
    }
    // default string
    return val;
}

/**
 * Build TypeORM-compatible findMany options (where, order, skip, take)
 *
 * query: Record<string,string|string[]|undefined> from request query
 * allowedFieldsOrOpts: either the list of allowed fields or a full QueryConfig
 * opts: optional QueryConfig if the first argument was just allowedFields
 */
export function buildQueryOptions<T = any>(
    query: Record<string, string | string[] | undefined>,
    allowedFieldsOrOpts: string[] | QueryConfig,
    opts?: QueryConfig
) {
    const config: QueryConfig = Array.isArray(allowedFieldsOrOpts)
        ? { allowedFields: allowedFieldsOrOpts, ...opts }
        : allowedFieldsOrOpts;

    const {
        fieldTypes = {},
        enumValues = {},
        defaultPerPage,
        maxPerPage,
        defaultSort,
        allowCount,
        allowedFields = [],
    } = {
        ...QUERY_DEFAULTS,
        ...config,
    };

    const where: any = {};

    // parse every query key
    for (const rawKey in query) {
        if (!Object.prototype.hasOwnProperty.call(query, rawKey)) continue;

        // standard params handled separately
        if (["page", "perPage", "limit", "offset", "sort", "orderBy", "includeCount"].includes(rawKey))
            continue;

        // Accept keys like: age[gt], name[contains], tags[in], status
        const m = rawKey.match(/^(.+?)(?:\[(.+)\])?$/);
        if (!m) continue;

        const field = m[1];
        const op = m[2] ?? "equals";

        if (!allowedFields.includes(field)) continue;

        const rawVal = query[rawKey];
        const values = Array.isArray(rawVal) ? rawVal : rawVal === undefined ? [] : [rawVal];
        if (values.length === 0) continue;

        const fType: FieldType = (fieldTypes[field] as FieldType) ?? "string";

        // Map operators to TypeORM functions
        const getOperator = (operator: string, value: any) => {
            switch (operator) {
                case "equals": return Equal(value);
                case "not": return Not(Equal(value));
                case "lt": return LessThan(value);
                case "lte": return LessThanOrEqual(value);
                case "gt": return MoreThan(value);
                case "gte": return MoreThanOrEqual(value);
                case "contains": return Like(`%${value}%`);
                case "icontains": return ILike(`%${value}%`);
                case "startsWith": return Like(`${value}%`);
                case "endsWith": return Like(`%${value}`);
                case "in": return In(Array.isArray(value) ? value : [value]);
                case "notIn": return Not(In(Array.isArray(value) ? value : [value]));
                default: return Equal(value);
            }
        };

        if (op === "in" || op === "notIn") {
            const allVals = values.flatMap((v) => (v ? String(v).split(",") : []));
            const casted = allVals.map((v) => castValue(v.trim(), fType, enumValues[field])).filter((v) => v !== undefined);
            if (casted.length === 0) continue;
            where[field] = getOperator(op, casted);
            continue;
        }

        if (values.length > 1 && op === "equals") {
            const casted = values.map((v) => castValue(String(v), fType, enumValues[field])).filter((v) => v !== undefined);
            if (casted.length === 0) continue;
            where[field] = In(casted);
            continue;
        }

        const v = String(values[0]);
        const casted = castValue(v, fType, enumValues[field]);
        if (casted === undefined) continue;

        where[field] = getOperator(op, casted);
    }

    // Sorting
    const sortRaw = (query.sort ?? query.orderBy) as string | undefined;
    let order: any = {};

    if (sortRaw) {
        const tokens = String(sortRaw).split(",").map((s) => s.trim()).filter(Boolean);
        for (const token of tokens) {
            const dir = token.startsWith("-") ? "DESC" : "ASC";
            const field = token.replace(/^-/, "");
            if (allowedFields.includes(field)) {
                order[field] = dir;
            }
        }
    } else if (defaultSort) {
        const ds = Array.isArray(defaultSort) ? defaultSort : [defaultSort];
        for (const t of ds) {
            const dir = String(t).startsWith("-") ? "DESC" : "ASC";
            const field = String(t).replace(/^-/, "");
            if (allowedFields.includes(field)) {
                order[field] = dir;
            }
        }
    }

    // Pagination
    let page = 1;
    let perPage = defaultPerPage ?? QUERY_DEFAULTS.defaultPerPage!;

    if (query.page !== undefined) {
        const p = parseInt(String(query.page), 10);
        if (!Number.isNaN(p) && p > 0) page = p;
    }
    if (query.perPage !== undefined) {
        const pp = parseInt(String(query.perPage), 10);
        if (!Number.isNaN(pp) && pp > 0) perPage = pp;
    } else if (query.limit !== undefined) {
        const pp = parseInt(String(query.limit), 10);
        if (!Number.isNaN(pp) && pp > 0) perPage = pp;
    }

    const finalMax = maxPerPage ?? QUERY_DEFAULTS.maxPerPage!;
    if (perPage > finalMax) perPage = finalMax;

    let skip = (page - 1) * perPage;
    if (query.offset !== undefined) {
        const off = parseInt(String(query.offset), 10);
        if (!Number.isNaN(off) && off >= 0) skip = off;
    }

    const take = perPage;

    // includeCount
    const includeCountParam = query.includeCount;
    let includeCount = allowCount ?? QUERY_DEFAULTS.allowCount!;
    if (includeCountParam !== undefined) {
        const v = String(includeCountParam).toLowerCase();
        includeCount = !(v === "false" || v === "0" || v === "no");
    }

    return {
        metaStats: {
            page,
            perPage: take,
            skip,
            take,
        },
        typeormQuery: {
            where,
            order,
            skip,
            take,
        } as FindManyOptions<T>,
        includeCount
    };
}
