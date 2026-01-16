/**
 * PostgreSQL 에러 핸들링 유틸리티
 */
export interface DbError {
    code?: string;
    message?: string;
    [key: string]: any;
}

export interface DbErrorHandlerOptions {
    logError?: boolean;
    returnEmptyOnError?: boolean;
    additionalErrorCodes?: string[];
    additionalMessagePatterns?: string[];
    logContext?: Record<string, any>;
}

const DEFAULT_ERROR_CODES = ['42P01', '42703', '42501', '22P02'];
const DEFAULT_MESSAGE_PATTERNS = [
    'uuid', '잘못된 입력', 'invalid input syntax',
    'does not exist', 'permission denied'
];

export function isDataNotFoundError(
    err: DbError,
    options?: DbErrorHandlerOptions
): boolean {
    const errorCode = err?.code;
    const errorMessage = (err?.message || '').toLowerCase();
    const errorCodes = [...DEFAULT_ERROR_CODES, ...(options?.additionalErrorCodes || [])];
    const messagePatterns = [...DEFAULT_MESSAGE_PATTERNS, ...(options?.additionalMessagePatterns || [])];

    if (errorCode && errorCodes.includes(errorCode)) return true;

    const hasUuidError = errorMessage.includes('uuid') &&
        (errorMessage.includes('잘못된 입력') || errorMessage.includes('invalid'));
    const hasPatternMatch = messagePatterns.some(p => errorMessage.includes(p.toLowerCase()));

    return hasUuidError || hasPatternMatch;
}

export function handleDbError<T>(
    err: DbError,
    options?: DbErrorHandlerOptions
): T[] | null {
    const { logError = true, returnEmptyOnError = true } = options || {};

    if (isDataNotFoundError(err, options)) {
        return returnEmptyOnError ? [] : null;
    }

    if (logError) {
        console.error('[DB ERROR]', {
            code: err?.code,
            message: err?.message,
            ...(options?.logContext || {}),
            error: err,
        });
    }

    throw err;
}

export async function executeQuery<T>(
    queryFn: () => Promise<T[]>,
    options?: DbErrorHandlerOptions
): Promise<T[]> {
    try {
        return await queryFn();
    } catch (err: any) {
        const result = handleDbError<T>(err, options);
        return result || [];
    }
}

