import { Prisma } from "@prisma/client";

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
    allowCount: true,
};

// operators allowed and how they map to Prisma filter keys
const PRISMA_OPS = new Set([
    "equals",
    "not",
    "in",
    "notIn",
    "lt",
    "lte",
    "gt",
    "gte",
    "contains",
    "startsWith",
    "endsWith",
    "mode", // special: used with contains/startsWith/endsWith for caseInsensitive
]);

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
 * Build Prisma-compatible findMany options (where, orderBy, skip, take, page/perPage)
 *
 * query: Record<string,string|string[]|undefined> from Hono's c.req.query()
 * allowedFields: fields that are allowed to be used in filters/sort
 * opts: fieldTypes, enumValues etc
 */
export function buildQueryOptions(
    query: Record<string, string | string[] | undefined>,
    allowedFields: string[],
    opts?: Options) {
    const { fieldTypes = {}, enumValues = {}, defaultPerPage, maxPerPage, defaultSort, allowCount } = {
        ...DEFAULTS,
        ...(opts || {}),
    };

    const where: Record<string, any> = {};
    // parse every query key
    for (const rawKey in query) {
        if (!Object.prototype.hasOwnProperty.call(query, rawKey)) continue;
        // page/perPage/sort/includeCount/limit/offset handled later
        if (["page", "perPage", "limit", "offset", "sort", "orderBy", "includeCount"].includes(rawKey))
            continue;

        // Accept keys like: age[gt], name[contains], tags[in], status
        // regex captures: fieldName and optional operator
        const m = rawKey.match(/^(.+?)(?:\[(.+)\])?$/);
        if (!m) continue;
        const field = m[1];
        const op = m[2] ?? "equals";

        if (!allowedFields.includes(field)) {
            // ignore fields not allowed — prevents abuse/injection
            continue;
        }

        // normalize incoming values to array
        const rawVal = query[rawKey];
        const values = Array.isArray(rawVal) ? rawVal : rawVal === undefined ? [] : [rawVal];

        if (values.length === 0) continue;

        // determine field type for casting (default string)
        const fType: FieldType = (fieldTypes[field] as FieldType) ?? "string";

        // special handling for 'in' operator if single param with comma-separated values
        if (op === "in" || op === "notIn") {
            // combine all occurrences and split commas
            const allVals: string[] = values.flatMap((v) => (v ? String(v).split(",") : []));
            const casted = allVals.map((v) => castValue(v.trim(), fType, enumValues[field])).filter((v) => v !== undefined);
            if (casted.length === 0) continue; // Skip if no valid values
            where[field] = { ...(where[field] || {}), [op]: casted };
            continue;
        }

        // if multiple occurrences of the same simple key (e.g., tag=a&tag=b),
        // treat as 'in'
        if (values.length > 1 && op === "equals") {
            const casted = values.map((v) => castValue(String(v), fType, enumValues[field])).filter((v) => v !== undefined);
            if (casted.length === 0) continue; // Skip if no valid values
            where[field] = { in: casted };
            continue;
        }

        // single value, map supported ops to Prisma
        const v = String(values[0]);
        const casted = castValue(v, fType, enumValues[field]);
        if (casted === undefined) continue; // Skip invalid enum values

        if (["equals", "not", "lt", "lte", "gt", "gte", "contains", "startsWith", "endsWith"].includes(op)) {
            // For case-insensitive string ops, allow special query param like name[contains]&ci=1
            // but keep it simple: when string-based op used, provide case-insensitive via mode if requested:
            if (["contains", "startsWith", "endsWith"].includes(op)) {
                // default: case-sensitive; user can add another param `${field}[mode]=insensitive`
                where[field] = { ...(where[field] || {}), [op]: casted };
            } else {
                where[field] = { ...(where[field] || {}), [op]: casted };
            }
            continue;
        }

        // fallback: equals
        where[field] = casted;
    }

    // Sorting
    const sortRaw = (query.sort ?? query.orderBy) as string | undefined;

    // OLD code
    // let orderBy: Prisma.Enumerable<Record<string, "asc" | "desc">> | undefined = undefined;
    let orderBy: Record<string, "asc" | "desc">[] | undefined = undefined;

    if (sortRaw) {
        const tokens = String(sortRaw).split(",").map((s) => s.trim()).filter(Boolean);
        const arr: any[] = [];
        for (const token of tokens) {
            const dir = token.startsWith("-") ? "desc" : "asc";
            const field = token.replace(/^-/, "");
            if (!allowedFields.includes(field)) continue; // ignore unknown fields
            arr.push({ [field]: dir });
        }
        if (arr.length) orderBy = arr;
    } else if (defaultSort) {
        const ds = Array.isArray(defaultSort) ? defaultSort : [defaultSort];
        const arr = ds.map((t) => {
            const dir = String(t).startsWith("-") ? "desc" : "asc";
            const field = String(t).replace(/^-/, "");
            return { [field]: dir };
        }).filter((o) => Object.keys(o).every((f) => allowedFields.includes(f)));
        if (arr.length) orderBy = arr as any;
    }

    // Pagination - prefer page/perPage; allow limit/offset fallback
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

    // includeCount: default to allowCount unless explicitly set to false / 0
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
        prismaQuery: {
            where,
            orderBy,
            skip,
            take,
        },
        includeCount
    };
}