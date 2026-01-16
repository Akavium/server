import { Request } from 'express';
import { AdvancedSearchOptions } from '../repository/repository';

export interface SearchParams<T> {
    searchFields?: (keyof T)[];
    searchTerm?: string;
    searchMode?: 'like' | 'ilike' | 'fts';
    caseSensitive?: boolean;
    multiWord?: boolean;
}

export interface SearchValidationResult<T> {
    isValid: boolean;
    error?: {
        status: number;
        message: string;
    };
    params?: AdvancedSearchOptions<T>;
}

/**
 * 요청에서 검색 파라미터를 추출하고 검증합니다.
 * @param req Express Request 객체
 * @param allowedFields 검색 가능한 필드 목록
 * @param defaultFields 기본 검색 필드
 * @returns 검증 결과와 파라미터
 */
export function validateSearchParams<T>(
    req: Request,
    allowedFields: (keyof T)[],
    defaultFields?: (keyof T)[]
): SearchValidationResult<T> {
    const searchTerm = req.query.search as string | undefined;
    const searchFields = req.query.searchFields 
        ? (req.query.searchFields as string).split(',') as (keyof T)[]
        : defaultFields;
    const searchMode = (req.query.searchMode as 'like' | 'ilike' | 'fts' | undefined) || 'ilike';
    const caseSensitive = req.query.caseSensitive === 'true';
    const multiWord = req.query.multiWord === 'true';

    // 검색어가 없으면 검색 파라미터 없음
    if (!searchTerm) {
        return { isValid: true, params: undefined };
    }

    // 검색 필드 검증
    if (searchFields) {
        const invalidFields = searchFields.filter(field => !allowedFields.includes(field));
        if (invalidFields.length > 0) {
            return {
                isValid: false,
                error: {
                    status: 400,
                    message: `유효하지 않은 검색 필드: ${invalidFields.join(', ')}`
                }
            };
        }
    }

    // 검색 모드 검증
    if (!['like', 'ilike', 'fts'].includes(searchMode)) {
        return {
            isValid: false,
            error: {
                status: 400,
                message: '검색 모드는 like, ilike, fts 중 하나여야 합니다.'
            }
        };
    }

    return {
        isValid: true,
        params: {
            searchTerm,
            searchFields: searchFields || defaultFields,
            searchMode,
            caseSensitive,
            multiWord
        }
    };
}

