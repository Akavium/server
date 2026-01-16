import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * 커스텀 에러 클래스
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly errorCode?: string;
    public readonly details?: any;

    constructor(
        message: string,
        statusCode: number = 500,
        errorCode?: string,
        details?: any,
        isOperational: boolean = true
    ) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.errorCode = errorCode;
        this.details = details;

        // 프로토타입 체인 유지
        Object.setPrototypeOf(this, AppError.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * 검증 에러 클래스
 */
export class ValidationError extends AppError {
    constructor(message: string, details?: any) {
        super(message, 400, 'VALIDATION_ERROR', details);
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}

/**
 * 인증 에러 클래스
 */
export class AuthenticationError extends AppError {
    constructor(message: string = 'Authentication failed', details?: any) {
        super(message, 401, 'AUTHENTICATION_ERROR', details);
        Object.setPrototypeOf(this, AuthenticationError.prototype);
    }
}

/**
 * 권한 에러 클래스
 */
export class AuthorizationError extends AppError {
    constructor(message: string = 'Insufficient permissions', details?: any) {
        super(message, 403, 'AUTHORIZATION_ERROR', details);
        Object.setPrototypeOf(this, AuthorizationError.prototype);
    }
}

/**
 * 리소스 찾기 실패 에러 클래스
 */
export class NotFoundError extends AppError {
    constructor(message: string = 'Resource not found', details?: any) {
        super(message, 404, 'NOT_FOUND_ERROR', details);
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

/**
 * 충돌 에러 클래스 (중복 리소스 등)
 */
export class ConflictError extends AppError {
    constructor(message: string = 'Resource conflict', details?: any) {
        super(message, 409, 'CONFLICT_ERROR', details);
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}

/**
 * 비즈니스 로직 에러 클래스
 */
export class BusinessLogicError extends AppError {
    constructor(message: string, details?: any) {
        super(message, 422, 'BUSINESS_LOGIC_ERROR', details);
        Object.setPrototypeOf(this, BusinessLogicError.prototype);
    }
}

/**
 * 데이터베이스 에러 클래스
 */
export class DatabaseError extends AppError {
    constructor(message: string = 'Database operation failed', details?: any) {
        super(message, 500, 'DATABASE_ERROR', details, false);
        Object.setPrototypeOf(this, DatabaseError.prototype);
    }
}

/**
 * 외부 API 에러 클래스
 */
export class ExternalAPIError extends AppError {
    constructor(message: string = 'External API request failed', details?: any) {
        super(message, 502, 'EXTERNAL_API_ERROR', details);
        Object.setPrototypeOf(this, ExternalAPIError.prototype);
    }
}

/**
 * Rate Limit 에러 클래스
 */
export class RateLimitError extends AppError {
    constructor(message: string = 'Too many requests', details?: any) {
        super(message, 429, 'RATE_LIMIT_ERROR', details);
        Object.setPrototypeOf(this, RateLimitError.prototype);
    }
}

/**
 * 에러 핸들러 설정 인터페이스
 */
export interface ErrorHandlerOptions {
    // 로깅 함수
    logger?: (error: Error, req: Request) => void;
    // 커스텀 에러 응답 변환 함수
    errorTransformer?: (error: Error) => any;
    // 스택 트레이스 표시 여부 (개발 환경용)
    showStackTrace?: boolean;
    // 에러 알림 함수 (Slack, Email 등)
    notifyError?: (error: Error, req: Request) => Promise<void>;
    // 에러 메트릭 수집 함수
    collectMetrics?: (error: Error, req: Request) => void;
}

/**
 * 기본 에러 로거
 */
const defaultLogger = (error: Error, req: Request) => {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error(`[${new Date().toISOString()}] Error occurred`);
    console.error(`Path: ${req.method} ${req.path}`);
    console.error(`IP: ${req.ip}`);
    if (error instanceof AppError) {
        console.error(`Error Code: ${error.errorCode}`);
        console.error(`Status Code: ${error.statusCode}`);
        console.error(`Operational: ${error.isOperational}`);
    }
    console.error(`Message: ${error.message}`);
    console.error(`Stack: ${error.stack}`);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
};

/**
 * 에러를 응답 가능한 형태로 변환
 */
function transformError(
    error: Error,
    showStackTrace: boolean = false,
    customTransformer?: (error: Error) => any
): any {
    if (customTransformer) {
        return customTransformer(error);
    }

    if (error instanceof AppError) {
        return {
            ok: false,
            statusCode: error.statusCode,
            errorCode: error.errorCode,
            message: error.message,
            details: error.details,
            ...(showStackTrace && { stack: error.stack })
        };
    }

    // 일반 에러 처리
    return {
        ok: false,
        statusCode: 500,
        errorCode: 'INTERNAL_SERVER_ERROR',
        message: 'Internal Server Error',
        ...(showStackTrace && {
            originalMessage: error.message,
            stack: error.stack
        })
    };
}

/**
 * 비동기 에러를 캐치하는 래퍼 함수 (강화 버전)
 * @param fn 비동기 라우트 핸들러
 * @param options 에러 핸들링 옵션
 * @returns Express RequestHandler
 */
export function catchAsyncErrors(
    fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
    options: ErrorHandlerOptions = {}
): RequestHandler {
    const {
        logger = defaultLogger,
        errorTransformer,
        showStackTrace = process.env.NODE_ENV === 'development',
        notifyError,
        collectMetrics
    } = options;

    return (req: Request, res: Response, next: NextFunction) => {
        return fn(req, res, next).catch(async (error: unknown) => {
            // Error 타입 보장
            const err = error instanceof Error ? error : new Error(String(error));

            // 로깅
            try {
                logger(err, req);
            } catch (logError) {
                console.error('Logger failed:', logError);
            }

            // 메트릭 수집
            if (collectMetrics) {
                try {
                    collectMetrics(err, req);
                } catch (metricsError) {
                    console.error('Metrics collection failed:', metricsError);
                }
            }

            // 에러 알림 (비동기, 응답 차단하지 않음)
            if (notifyError && err instanceof AppError && !err.isOperational) {
                notifyError(err, req).catch(notifyErr => {
                    console.error('Error notification failed:', notifyErr);
                });
            }

            // 응답 전송
            const errorResponse = transformError(err, showStackTrace, errorTransformer);
            const statusCode = err instanceof AppError ? err.statusCode : 500;

            return res.status(statusCode).json(errorResponse);
        });
    };
}

/**
 * 여러 에러 핸들러를 조합하는 유틸리티
 * @param handlers 에러 핸들러 배열 (첫 번째로 처리하는 핸들러가 우선)
 * @returns 조합된 에러 핸들러
 */
export function composeErrorHandlers(
    ...handlers: Array<(error: Error, req: Request, res: Response) => boolean>
) {
    return (error: Error, req: Request, res: Response): boolean => {
        for (const handler of handlers) {
            const handled = handler(error, req, res);
            if (handled) return true;
        }
        return false;
    };
}

/**
 * 글로벌 에러 핸들러 미들웨어
 */
export function globalErrorHandler(
    options: ErrorHandlerOptions = {}
): (error: Error, req: Request, res: Response, next: NextFunction) => void {
    const {
        logger = defaultLogger,
        errorTransformer,
        showStackTrace = process.env.NODE_ENV === 'development',
        notifyError,
        collectMetrics
    } = options;

    return async (error: Error, req: Request, res: Response, next: NextFunction) => {
        // 이미 응답이 전송된 경우
        if (res.headersSent) {
            return next(error);
        }

        // 로깅
        try {
            logger(error, req);
        } catch (logError) {
            console.error('Logger failed:', logError);
        }

        // 메트릭 수집
        if (collectMetrics) {
            try {
                collectMetrics(error, req);
            } catch (metricsError) {
                console.error('Metrics collection failed:', metricsError);
            }
        }

        // 에러 알림
        if (notifyError && error instanceof AppError && !error.isOperational) {
            notifyError(error, req).catch(notifyErr => {
                console.error('Error notification failed:', notifyErr);
            });
        }

        // 응답 전송
        const errorResponse = transformError(error, showStackTrace, errorTransformer);
        const statusCode = error instanceof AppError ? error.statusCode : 500;

        return res.status(statusCode).json(errorResponse);
    };
}

/**
 * 처리되지 않은 Promise rejection 핸들러
 */
export function setupUnhandledRejectionHandler() {
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('Unhandled Rejection at:', promise);
        console.error('Reason:', reason);
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        // 프로세스 종료하지 않고 로깅만 수행
    });
}

/**
 * 처리되지 않은 예외 핸들러
 */
export function setupUncaughtExceptionHandler() {
    process.on('uncaughtException', (error: Error) => {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('Uncaught Exception:');
        console.error(error);
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        // 심각한 에러이므로 프로세스 종료
        process.exit(1);
    });
}

/**
 * 전체 에러 핸들링 시스템 초기화
 */
export function initializeErrorHandling(options: ErrorHandlerOptions = {}) {
    setupUnhandledRejectionHandler();
    setupUncaughtExceptionHandler();
    return globalErrorHandler(options);
}

