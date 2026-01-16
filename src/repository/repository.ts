import { query } from '../configs/pool';
import { handleDbError } from '../utils/dbErrorHandler';
export type Operator = '=' | '!=' | '<>' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'ILIKE' | 'IN' | 'NOT IN';

export type WhereOperators<T> = {
    '='?: T;
    '!='?: T;
    '<>'?: T;
    '>'?: T;
    '<'?: T;
    '>='?: T;
    '<='?: T;
    'LIKE'?: T;
    'ILIKE'?: T;
    'IN'?: T extends (infer U)[] ? U[] : T | T[];
    'NOT IN'?: T extends (infer U)[] ? U[] : T | T[];
};

export type Where<T> = {
    [P in keyof T]?: T[P] | WhereOperators<T[P]>;
};

export interface PaginationOptions {
    page?: number;
    limit?: number;
}
export interface SearchOptions<T> {
    searchFields?: (keyof T)[];
    searchTerm?: string;
}
export interface PaginatedResult<T> {
    data: T[];
    pagination: {
        page: number; // 현재 페이지 번호
        limit: number; // 페이지당 데이터 개수
        total: number; // 총 데이터 개수
        totalPages: number; // 총 페이지 수
        hasNext: boolean; // 다음 페이지 존재 여부
        hasPrev: boolean; // 이전 페이지 존재 여부
    };
    searchInfo?: {
        searchTerm?: string; // 검색어
        searchedFields?: (keyof T)[]; // 검색필드
        searchMode?: 'like' | 'ilike' | 'fts'; // 검색모드 like: 부분 검색, ilike: 대소문자 구분 없는 부분 검색, fts: 전체 검색
        caseSensitive?: boolean; // 대소문자 구분 여부
        multiWord?: boolean; // 여러 단어 검색 여부
    };
}
interface WhereClauseResult {
    sql: string;
    values: any[];
}
export interface AdvancedSearchOptions<T> {
    searchFields?: (keyof T)[]; // 검색필드
    searchTerm?: string; // 검색어
    searchMode?: 'like' | 'ilike' | 'fts'; // 검색모드 like: 부분 검색, ilike: 대소문자 구분 없는 부분 검색, fts: 전체 검색
    caseSensitive?: boolean; // 대소문자 구분 여부
    multiWord?: boolean; // 여러 단어 검색 여부
}

interface RepoOptions<T, AutoSetKeys extends keyof T = never> {
    table: string; // "schema.table" 또는 "table"
    keys: readonly (keyof T)[];
    autoSetKeys?: AutoSetKeys[];
    printQuery?: boolean;
}

function camelToSnake(str: string) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

function snakeToCamel<T extends Record<string, any>>(row: Record<string, any>): T {
    const result: any = {};
    for (const key in row) {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        result[camelKey] = row[key];
    }
    return result;
}

function validateKeys<T>(data: Record<string, any>, allowedKeys: readonly string[], tableName?: string) {
    const invalidKeys = Object.keys(data).filter(k => !allowedKeys.includes(k as any));
    if (invalidKeys.length > 0) {
        const target = tableName ?? 'unknown table';
        console.error(`Invalid keys for ${target}: ${invalidKeys.join(', ')}`);
        throw new Error(`Invalid keys for ${target}: ${invalidKeys.join(', ')}`);
    }
}

export function repository<
    T extends Record<string, any>,
    AutoSetKeys extends keyof T = never>(opts: RepoOptions<T, AutoSetKeys>) {
    const { table, keys, autoSetKeys = [], printQuery = false } = opts;

    let schema = "public";
    let tableNameOnly = table;

    if (table.includes(".")) {
        const [s, t] = table.split(".");
        schema = s;
        tableNameOnly = t;
    }

    const tableFull = `"${schema.replace(/"/g, "")}"."${tableNameOnly.replace(/"/g, "")}"`;

    const dbKeys = (keys as string[]).map(camelToSnake);

    const toDbKey = (key: string) => {
        const idx = (keys as string[]).indexOf(key as any);
        if (idx === -1) {
            throw new Error(`Unknown key '${key}' for table ${tableFull}`);
        }
        return dbKeys[idx];
    };

    async function runQuery<R>(sql: string, values?: any[]): Promise<R[]> {
        // 쿼리 최적화 적용
        const { sql: optimizedSql, values: optimizedValues } = optimizeQuery(sql, values || []);

        if (printQuery) {
            console.log("[SQL]", optimizedSql, optimizedValues);
        }

        try {
            return await query<R>(optimizedSql, optimizedValues);
        } catch (err: any) {
            const result = handleDbError<R>(err, {
                logError: false, // pool.ts에서 이미 로깅함
                returnEmptyOnError: true,
            });

            if (result !== null) {
                return result;
            }

            throw err;
        }
    }

    // 통합 WHERE 절 빌더
    function buildWhereClause<T>(
        where?: Where<T>,
        search?: AdvancedSearchOptions<T>
    ): WhereClauseResult {
        const values: any[] = [];
        const conditions: string[] = [];

        // WHERE 조건 처리
        if (where && Object.keys(where).length > 0) {
            const whereConditions = Object.entries(where).map(([k, v]) => {
                const dbKey = toDbKey(k);

                if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
                    const op = Object.keys(v)[0] as Operator;
                    const val = Object.values(v)[0];

                    if (op === 'IN' || op === 'NOT IN') {
                        if (Array.isArray(val)) {
                            const placeholders = val.map((item) => {
                                values.push(item);
                                return `$${values.length}`;
                            });
                            return `${dbKey} ${op} (${placeholders.join(', ')})`;
                        } else {
                            values.push(val);
                            return `${dbKey} ${op} $${values.length}`;
                        }
                    } else {
                        values.push(val);
                        return `${dbKey} ${op} $${values.length}`;
                    }
                } else {
                    values.push(v);
                    return `${dbKey} = $${values.length}`;
                }
            });
            conditions.push(...whereConditions);
        }

        // 검색 조건 처리
        if (search?.searchTerm && search?.searchFields && search.searchFields.length > 0) {
            const searchMode = search.searchMode || 'like';
            const caseSensitive = search.caseSensitive ?? false;
            const multiWord = search.multiWord ?? false;

            let searchConditions: string[] = [];

            if (searchMode === 'fts') {
                const ftsQuery = multiWord
                    ? search.searchTerm.split(' ').map(term => `"${term}"`).join(' & ')
                    : `"${search.searchTerm}"`;

                searchConditions = search.searchFields.map(field => {
                    const dbKey = toDbKey(field as string);
                    return `to_tsvector('english', ${dbKey}) @@ to_tsquery('english', $${values.length + 1})`;
                });

                values.push(ftsQuery);
            } else {
                const likeOperator = caseSensitive ? 'LIKE' : 'ILIKE';
                const searchPattern = multiWord
                    ? search.searchTerm.split(' ').map(term => `%${term}%`).join('')
                    : `%${search.searchTerm}%`;

                searchConditions = search.searchFields.map(field => {
                    const dbKey = toDbKey(field as string);
                    values.push(searchPattern);
                    return `${dbKey} ${likeOperator} $${values.length}`;
                });
            }

            conditions.push(`(${searchConditions.join(' OR ')})`);
        }

        return {
            sql: conditions.length > 0 ? ` WHERE ${conditions.join(" AND ")}` : '',
            values
        };
    }
    // 페이지네이션 검증 및 최적화
    function validatePagination(pagination?: PaginationOptions): { page: number; limit: number } {
        const page = Math.max(1, pagination?.page || 1);
        const limit = Math.max(1, Math.min(1000, pagination?.limit || 10));

        return { page, limit };
    }

    // SQL 쿼리 최적화 헬퍼
    function optimizeQuery(sql: string, values: any[]): { sql: string; values: any[] } {
        // 불필요한 공백 제거
        const optimizedSql = sql.replace(/\s+/g, ' ').trim();

        // 값 배열 최적화 (null/undefined 제거)
        const optimizedValues = values.filter(v => v !== undefined);

        return { sql: optimizedSql, values: optimizedValues };
    }

    async function executeCount(where?: Where<T>, search?: AdvancedSearchOptions<T>): Promise<number> {
        if (where) validateKeys(where, keys as string[], tableFull);

        const { sql: whereClause, values } = buildWhereClause(where, search);
        const sql = `SELECT COUNT(*) as total FROM ${tableFull}${whereClause}`;

        const result = await runQuery<{ total: string }>(sql, values);
        if (result.length === 0) return 0;
        return parseInt(result[0].total);
    }

    return {
        async select(
            where?: Where<T>,
            pagination?: PaginationOptions,
            search?: AdvancedSearchOptions<T>
        ): Promise<T[]> {
            if (where) validateKeys(where, keys as string[], tableFull);

            const { sql: whereClause, values } = buildWhereClause(where, search);
            let sql = `SELECT * FROM ${tableFull}${whereClause}`;

            if (pagination) {
                const { page, limit } = validatePagination(pagination);
                const offset = (page - 1) * limit;
                sql += ` LIMIT ${limit} OFFSET ${offset}`;
            }

            const rows = await runQuery<Record<string, any>>(sql, values);
            return rows.map(r => snakeToCamel<T>(r));
        },

        async selectWithPagination(
            where?: Where<T>,
            pagination?: PaginationOptions,
            search?: AdvancedSearchOptions<T>
        ): Promise<PaginatedResult<T>> {
            if (where) validateKeys(where, keys as string[], tableFull);

            const { page, limit } = validatePagination(pagination);
            const offset = (page - 1) * limit;

            // count 헬퍼 사용으로 코드 재사용성 향상
            const total = await executeCount(where, search);

            const { sql: whereClause, values } = buildWhereClause(where, search);

            if (offset >= total) {
                return {
                    data: [],
                    pagination: {
                        page,
                        limit,
                        total,
                        totalPages: Math.ceil(total / limit),
                        hasNext: false,
                        hasPrev: page > 1
                    },
                    searchInfo: search ? {
                        searchTerm: search.searchTerm,
                        searchedFields: search.searchFields,
                        searchMode: search.searchMode,
                        caseSensitive: search.caseSensitive,
                        multiWord: search.multiWord
                    } : undefined
                };
            }

            const dataSql = `SELECT * FROM ${tableFull}${whereClause} LIMIT ${limit} OFFSET ${offset}`;
            const rows = await runQuery<Record<string, any>>(dataSql, values);
            const data = rows.map(r => snakeToCamel<T>(r));

            const totalPages = Math.ceil(total / limit);
            const hasNext = page < totalPages;
            const hasPrev = page > 1;

            return {
                data,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNext,
                    hasPrev
                },
                searchInfo: search ? {
                    searchTerm: search.searchTerm,
                    searchedFields: search.searchFields,
                    searchMode: search.searchMode,
                    caseSensitive: search.caseSensitive,
                    multiWord: search.multiWord
                } : undefined
            };
        },

        async selectOne(where?: Where<T>, search?: AdvancedSearchOptions<T>): Promise<T | undefined> {
            if (where) validateKeys(where, keys as string[], tableFull);

            const { sql: whereClause, values } = buildWhereClause(where, search);
            const sql = `SELECT * FROM ${tableFull}${whereClause} LIMIT 1`;

            const rows = await runQuery<Record<string, any>>(sql, values);
            if (rows.length === 0) return undefined;
            return snakeToCamel<T>(rows[0]);
        },

        async insert(data: Partial<Omit<T, AutoSetKeys>>[]): Promise<T[]> {
            if (data.length === 0) return [];
            data.forEach(d => validateKeys(d as Partial<T>, keys as string[], tableFull));

            const cols = Object.keys(data[0]).filter(
                k => (keys as string[]).includes(k) && !autoSetKeys.includes(k as AutoSetKeys)
            );
            const dbCols = cols.map(toDbKey);

            const placeholders = data.map(
                (_, i) =>
                    `(${cols.map((_, j) => `$${i * cols.length + j + 1}`).join(",")})`
            );

            const values = data.flatMap(row => cols.map(c => (row as any)[c]));
            const sql = `INSERT INTO ${tableFull} (${dbCols.join(",")})
                                   VALUES ${placeholders.join(",")}
                                   RETURNING *`;

            const rows = await runQuery<Record<string, any>>(sql, values);
            return rows.map(r => snakeToCamel<T>(r));
        },

        async update(data: { where: Partial<T>; set: Partial<T> }[]): Promise<T[]> {
            if (data.length === 0) return [];

            // 단일 업데이트는 기존 방식 유지
            if (data.length === 1) {
                const { where, set } = data[0];
                validateKeys(set, keys as string[], tableFull);
                validateKeys(where, keys as string[], tableFull);

                const setEntries = Object.entries(set);
                const whereEntries = Object.entries(where);
                if (setEntries.length === 0 || whereEntries.length === 0) {
                    throw new Error('Update requires both "set" and "where"');
                }

                const values: any[] = [];
                const setSql = setEntries.map(([k, v], i) => {
                    values.push(v);
                    return `${toDbKey(k)}=$${i + 1}`;
                }).join(", ");
                const whereSql = whereEntries.map(([k, v], i) => {
                    values.push(v);
                    return `${toDbKey(k)}=$${i + 1 + setEntries.length}`;
                }).join(" AND ");

                const sql = `UPDATE ${tableFull} SET ${setSql} WHERE ${whereSql} RETURNING *`;
                const updated = await runQuery<Record<string, any>>(sql, values);
                return updated.map(r => snakeToCamel<T>(r));
            }

            // 다중 업데이트는 개별 처리 (트랜잭션 고려)
            const results: T[] = [];
            for (const { where, set } of data) {
                validateKeys(set, keys as string[], tableFull);
                validateKeys(where, keys as string[], tableFull);

                const setEntries = Object.entries(set);
                const whereEntries = Object.entries(where);
                if (setEntries.length === 0 || whereEntries.length === 0) {
                    throw new Error('Update requires both "set" and "where"');
                }

                const values: any[] = [];
                const setSql = setEntries.map(([k, v], i) => {
                    values.push(v);
                    return `${toDbKey(k)}=$${i + 1}`;
                }).join(", ");
                const whereSql = whereEntries.map(([k, v], i) => {
                    values.push(v);
                    return `${toDbKey(k)}=$${i + 1 + setEntries.length}`;
                }).join(" AND ");

                const sql = `UPDATE ${tableFull} SET ${setSql} WHERE ${whereSql} RETURNING *`;
                const updated = await runQuery<Record<string, any>>(sql, values);
                results.push(...updated.map(r => snakeToCamel<T>(r)));
            }

            return results;
        },

        async upsert(
            data: Partial<Omit<T, AutoSetKeys>>[],
            conflictKeys: (keyof T)[]
        ): Promise<T[]> {
            if (data.length === 0) return [];
            if (conflictKeys.length === 0) throw new Error("Upsert requires at least one conflict key");

            data.forEach(d => validateKeys(d as Partial<T>, keys as string[], tableFull));

            const cols = Object.keys(data[0]).filter(
                k => (keys as string[]).includes(k) && !autoSetKeys.includes(k as AutoSetKeys)
            );
            const dbCols = cols.map(toDbKey);
            const conflictDbKeys = conflictKeys.map(k => toDbKey(k as string));

            const placeholders = data.map(
                (_, i) =>
                    `(${cols.map((_, j) => `$${i * cols.length + j + 1}`).join(",")})`
            );

            const values = data.flatMap(row => cols.map(c => (row as any)[c]));

            const updateCols = cols.filter(c => !conflictKeys.includes(c as keyof T));
            const updateSql = updateCols.length > 0
                ? updateCols.map(c => `${toDbKey(c)} = EXCLUDED.${toDbKey(c)}`).join(", ")
                : dbCols.map(c => `${c} = EXCLUDED.${c}`).join(", ");

            const sql = `INSERT INTO ${tableFull} (${dbCols.join(",")})
                         VALUES ${placeholders.join(",")}
                         ON CONFLICT (${conflictDbKeys.join(",")})
                         DO UPDATE SET ${updateSql}
                         RETURNING *`;

            const rows = await runQuery<Record<string, any>>(sql, values);
            return rows.map(r => snakeToCamel<T>(r));
        },

        async delete(whereArr: Partial<T>[]): Promise<T[]> {
            if (whereArr.length === 0) return [];
            const results: T[] = [];

            for (const where of whereArr) {
                validateKeys(where, keys as string[], tableFull);
                const entries = Object.entries(where);
                if (entries.length === 0) throw new Error("Delete requires at least one key");

                const values: any[] = [];
                const whereSql = entries.map(([k, v], i) => {
                    values.push(v);
                    return `${toDbKey(k)}=$${i + 1}`;
                }).join(" AND ");

                const sql = `DELETE FROM ${tableFull} WHERE ${whereSql} RETURNING *`;
                const deleted = await runQuery<Record<string, any>>(sql, values);
                results.push(...deleted.map(r => snakeToCamel<T>(r)));
            }

            return results;
        },

        async count(where?: Where<T>, search?: AdvancedSearchOptions<T>): Promise<number> {
            return await executeCount(where, search);
        },
    };
}
