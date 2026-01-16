import { Request, Response, NextFunction } from 'express';
import { validateSearchParams } from '../utils/search';

/**
 * 검색 파라미터를 검증하고 req.search에 저장하는 미들웨어
 * @param allowedFields 검색 가능한 필드 목록
 * @param defaultFields 기본 검색 필드 (선택사항)
 */
export function searchMiddleware<T>(
    allowedFields: (keyof T)[],
    defaultFields?: (keyof T)[]
) {
    return (req: Request, res: Response, next: NextFunction) => {
        const validation = validateSearchParams<T>(req, allowedFields, defaultFields);

        if (!validation.isValid) {
            return res.status(validation.error!.status).json({
                message: validation.error!.message
            });
        }

        req.search = validation.params;
        next();
    };
}

