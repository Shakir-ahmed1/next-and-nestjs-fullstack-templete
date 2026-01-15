
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

type FieldType = "string" | "number" | "boolean" | "date" | "enum";

export type Options = {
    fieldTypes?: Record<string, FieldType>;
    defaultPerPage?: number;
    maxPerPage?: number;
    defaultSort?: string | string[]; // e.g. "-createdAt" or ["-createdAt","id"]
    allowCount?: boolean; // default true
    enumValues?: Record<string, string[]>; // Available values for enum fields
};

const DEFAULTS = {
    defaultPerPage: 20,
    maxPerPage: 100,
    allowCount: false,
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
 * allowedFields: fields that are allowed to be used in filters/sort
 * opts: fieldTypes, enumValues etc
 */
export function buildQueryOptions<T = any>(
    query: Record<string, string | string[] | undefined>,
    allowedFields: string[],
    opts?: Options
) {
    const { fieldTypes = {}, enumValues = {}, defaultPerPage, maxPerPage, defaultSort, allowCount } = {
        ...DEFAULTS,
        ...(opts || {}),
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
    let perPage = defaultPerPage ?? DEFAULTS.defaultPerPage;

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

    const finalMax = maxPerPage ?? DEFAULTS.maxPerPage;
    if (perPage > finalMax) perPage = finalMax;

    let skip = (page - 1) * perPage;
    if (query.offset !== undefined) {
        const off = parseInt(String(query.offset), 10);
        if (!Number.isNaN(off) && off >= 0) skip = off;
    }

    const take = perPage;

    // includeCount
    const includeCountParam = query.includeCount;
    let includeCount = allowCount ?? DEFAULTS.allowCount;
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
