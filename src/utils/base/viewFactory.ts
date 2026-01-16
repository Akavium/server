import { AdvancedSearchOptions, PaginatedResult, PaginationOptions, Where, repository } from '../../repository/repository';

type ViewConfig<T> = {
    table: string;
    keys: readonly (keyof T)[];
};

export function createViewService<T>(config: ViewConfig<T>) {
    const view = repository<T>({ table: config.table, keys: config.keys });

    async function read(
        where?: Where<T>,
        pagination?: PaginationOptions,
        search?: AdvancedSearchOptions<T>
    ): Promise<T[] | PaginatedResult<T>> {
        const validWhere = where ? where : {};
        if (pagination && search) return await view.selectWithPagination(validWhere, pagination, search);
        if (pagination) return await view.select(validWhere, pagination);
        if (search) return await view.select(validWhere, undefined, search);
        return await view.select(validWhere) || [];
    }

    async function readOne(
        where?: Where<T>,
        search?: AdvancedSearchOptions<T>
    ): Promise<T | null> {
        return (await view.selectOne(where ? where : undefined, search)) || null;
    }

    return { read, readOne };
}

