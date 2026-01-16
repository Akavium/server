import { Request, Response, NextFunction } from 'express';
import { validatePaginationParams, PaginationParams } from '../utils/pagination';
/**
 * 페이지네이션 파라미터를 검증하고 req.pagination에 저장하는 미들웨어
 * @param customDefaults 커스텀 기본값 (선택사항)
 */
export function paginationMiddleware(customDefaults?: Partial<PaginationParams>) {
    return (req: Request, res: Response, next: NextFunction) => {
        const validation = validatePaginationParams(req, customDefaults);

        if (!validation.isValid) {
            return res.status(validation.error!.status).json({
                message: validation.error!.message,
                ...(validation.error!.pagination && { pagination: validation.error!.pagination })
            });
        }
        req.pagination = validation.params!;
        next();
    };
}
