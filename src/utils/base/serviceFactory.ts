import { AdvancedSearchOptions, PaginatedResult, PaginationOptions, Where, repository } from '../../repository/repository';

type ServiceConfig<T, AutoKeys extends keyof T = never> = {
    table: string;
    keys: readonly (keyof T)[];
};

export function createService<T, AutoKeys extends keyof T = never>(
    config: ServiceConfig<T, AutoKeys>
) {
    const repo = repository<T, AutoKeys>({ table: config.table, keys: config.keys });

    async function read(
        props?: Where<T>,
        pagination?: PaginationOptions,
        search?: AdvancedSearchOptions<T>
    ): Promise<T[] | PaginatedResult<T>> {
        const validProps = props ? props : {};
        if (search && pagination) return await repo.selectWithPagination(validProps, pagination, search);
        if (pagination) return await repo.selectWithPagination(validProps, pagination);
        if (search) return await repo.select(validProps, undefined, search);
        return await repo.select(validProps) || [];
    }

    async function readOne(props: Where<T>): Promise<T | undefined> {
        return (await repo.selectOne(props ? props : undefined)) || undefined;
    }

    async function create(data: Omit<T, AutoKeys>): Promise<T> {
        const [result] = await repo.insert([data]);
        return result;
    }

    async function createMany(data: Omit<T, AutoKeys>[]): Promise<T[]> {
        return await repo.insert(data);
    }

    async function update(props: Partial<T>, set: Partial<Omit<T, AutoKeys>>): Promise<T> {
        const [result] = await repo.update([{ where: props, set: set as Partial<T> }]);
        return result;
    }

    async function upsert(data: Partial<Omit<T, AutoKeys>>, conflictKeys: (keyof T)[]): Promise<T> {
        const [result] = await repo.upsert([data as Partial<T>], conflictKeys);
        return result;
    }

    async function upsertMany(
        data: Partial<Omit<T, AutoKeys>>[],
        conflictKeys: (keyof T)[]
    ): Promise<T[]> {
        return await repo.upsert(data.map(d => d as Partial<T>), conflictKeys);
    }

    async function _delete(props: Partial<T>): Promise<T | undefined> {
        const [result] = await repo.delete([props]);
        return result || undefined;
    }

    async function count(props?: Where<T>, search?: AdvancedSearchOptions<T>): Promise<number> {
        const validProps = props ? props : {};
        return await repo.count(validProps, search);
    }

    return { read, readOne, create, createMany, update, upsert, upsertMany, delete: _delete, count };
}

