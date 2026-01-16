import { Request, Response, NextFunction } from 'express';
import { ApiToResponse } from '../interfaces/api/Api';

/**
 * 전역 에러 핸들러 미들웨어
 * 모든 에러를 ToApi 형식으로 처리합니다.
 */
export const errorHandler = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    console.error('Global error handler:', error);

    // 이미 응답이 전송된 경우
    if (res.headersSent) {
        return next(error);
    }

    // 기본 에러 응답
    let errorResponse: ApiToResponse<never> = {
        ok: false,
        status: 'error',
        statusCode: 500,
        message: error.message || 'Internal Server Error'
    };

    // 특정 에러 타입별 처리
    if (error.name === 'ValidationError') {
        errorResponse = {
            ok: false,
            status: 'error',
            statusCode: 400,
            message: 'Validation Error'
        };
    } else if (error.name === 'UnauthorizedError') {
        errorResponse = {
            ok: false,
            status: 'error',
            statusCode: 401,
            message: 'Unauthorized'
        };
    } else if (error.name === 'ForbiddenError') {
        errorResponse = {
            ok: false,
            status: 'error',
            statusCode: 403,
            message: 'Forbidden'
        };
    } else if (error.name === 'NotFoundError') {
        errorResponse = {
            ok: false,
            status: 'error',
            statusCode: 404,
            message: 'Not Found'
        };
    }

    res.status(errorResponse.statusCode).json(errorResponse);
};

/**
 * 404 에러 핸들러
 * 정의되지 않은 라우트에 대한 응답을 ToApi 형식으로 처리합니다.
 */
export const notFoundHandler = (req: Request, res: Response): void => {
    const errorResponse: ApiToResponse<never> = {
        ok: false,
        status: 'error',
        statusCode: 404,
        message: `Route ${req.originalUrl} not found`
    };

    res.status(404).json(errorResponse);
};
