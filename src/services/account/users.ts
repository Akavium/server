import { User, UserAutoSetKeys, userKeys } from '../../interfaces/account/Users';
import { AdvancedSearchOptions, PaginatedResult, PaginationOptions, repository, Where } from '../../repository/repository';

const repo = repository<User, UserAutoSetKeys>({
    table: 'account.users',
    keys: userKeys,
});

async function read(
    props?: Where<User>,
    pagination?: PaginationOptions,
    search?: AdvancedSearchOptions<User>
): Promise<User[] | PaginatedResult<User>> {
    const validProps = props ? props : {};
    if (pagination) return await repo.selectWithPagination(validProps, pagination, search);
    return await repo.select(validProps, undefined, search) || [];
}

async function readOne(props: Where<User>): Promise<User | undefined> {
    return (await repo.selectOne(props)) || undefined;
}

async function create(data: Omit<User, UserAutoSetKeys>): Promise<User> {
    const [result] = await repo.insert([data]);
    return result;
}

async function update(props: Partial<User>, set: Partial<Omit<User, UserAutoSetKeys>>): Promise<User> {
    const [result] = await repo.update([{ where: props, set: set }]);
    return result;
}

async function _delete(props: Partial<User>): Promise<User | undefined> {
    const [result] = await repo.delete([props]);
    return result || undefined;
}

const userService = {
    read,
    readOne,
    create,
    update,
    delete: _delete,
}

export default userService