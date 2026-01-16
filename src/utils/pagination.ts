import { Request, Response } from 'express';
import { PAGINATION_DEFAULTS, PAGINATION_ERRORS } from '../configs/pagination';

export interface PaginationParams {
    page: number;
    limit: number;
}

export interface PaginationValidationResult {
    isValid: boolean;
    error?: {
        status: number;
        message: string;
        pagination?: any;
    };
    params?: PaginationParams;
}

/**
 * 요청에서 페이지네이션 파라미터를 추출하고 검증합니다.
 * @param req Express Request 객체
 * @param customDefaults 커스텀 기본값 (선택사항)
 * @returns 검증 결과와 파라미터
 */
export function validatePaginationParams(
    req: Request,
    customDefaults?: Partial<PaginationParams>
): PaginationValidationResult {
    const page = Number(req.query.page) || customDefaults?.page || PAGINATION_DEFAULTS.page;
    const limit = Number(req.query.limit) || customDefaults?.limit || PAGINATION_DEFAULTS.limit;

    // 페이지 번호 검증
    if (page < 1 || !Number.isInteger(page)) {
        return {
            isValid: false,
            error: {
                status: 400,
                message: PAGINATION_ERRORS.INVALID_PAGE
            }
        };
    }

    // limit 검증
    if (limit < PAGINATION_DEFAULTS.minLimit ||
        limit > PAGINATION_DEFAULTS.maxLimit ||
        !Number.isInteger(limit)) {
        return {
            isValid: false,
            error: {
                status: 400,
                message: PAGINATION_ERRORS.INVALID_LIMIT
            }
        };
    }

    return {
        isValid: true,
        params: { page, limit }
    };
}

/**
 * 페이지 존재 여부를 검증합니다.
 * @param currentPage 현재 요청된 페이지
 * @param totalPages 총 페이지 수
 * @param totalItems 총 아이템 수
 * @returns 검증 결과
 */
export function validatePageExists(
    currentPage: number,
    totalPages: number,
    totalItems: number
): PaginationValidationResult {
    if (currentPage > totalPages && totalItems > 0) {
        return {
            isValid: false,
            error: {
                status: 400,
                message: PAGINATION_ERRORS.PAGE_NOT_EXISTS(currentPage, totalPages),
                pagination: {
                    currentPage,
                    totalPages,
                    total: totalItems
                }
            }
        };
    }

    return { isValid: true };
}

/**
 * 페이지네이션 에러를 응답으로 전송합니다.
 * @param res Express Response 객체
 * @param error 에러 정보
 */
export function sendPaginationError(res: Response, error: PaginationValidationResult['error']): void {
    if (error?.pagination) {
        res.status(error.status).json({
            message: error.message,
            pagination: error.pagination
        });
    } else {
        res.status(error?.status || 400).json({
            message: error?.message || 'Invalid pagination parameters'
        });
    }
}
