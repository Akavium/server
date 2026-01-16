import { Response } from 'express';

interface ApiResponseData<T> {
    /**
     * @ok 성공 여부
     * @statusCode 상태 코드
     * @message 메시지
     * @data 데이터
     */
    ok: boolean;
    statusCode: number;
    message: string;
    data?: T;
}

export class ApiResponse {
    private static sendResponse<T>(
        res: Response,
        statusCode: number,
        ok: boolean,
        message: string,
        data?: T
    ): Response {
        const response: ApiResponseData<T> = {
            ok,
            statusCode,
            message,
            data
        };
        return res.status(statusCode).json(response);
    }

    static ok<T>(res: Response, data?: T, message: string = 'Success'): Response {
        return this.sendResponse(res, 200, true, message, data);
    }

    static created<T>(res: Response, data?: T, message: string = 'Created'): Response {
        return this.sendResponse(res, 201, true, message, data);
    }

    static badRequest<T>(res: Response, message: string = 'Bad Request', data?: T): Response {
        return this.sendResponse(res, 400, false, message, data);
    }

    static unauthorized<T>(res: Response, message: string = 'Unauthorized', data?: T): Response {
        return this.sendResponse(res, 401, false, message, data);
    }

    static forbidden<T>(res: Response, message: string = 'Forbidden', data?: T): Response {
        return this.sendResponse(res, 403, false, message, data);
    }

    static notFound<T>(res: Response, message: string = 'Not Found', data?: T): Response {
        return this.sendResponse(res, 404, false, message, data);
    }

    static imATeapot<T>(res: Response, message: string = 'I\'m a Teapot', data?: T): Response {
        return this.sendResponse(res, 418, false, message, data);
    } // 이스터에그 코드

    static tooManyRequests<T>(res: Response, message: string = 'TooManyRequests', data?: T): Response {
        return this.sendResponse(res, 429, false, message, data);
    }

    static internalError<T>(res: Response, message: string = 'Internal Server Error', data?: T): Response {
        return this.sendResponse(res, 500, false, message, data);
    }

    static badGateway<T>(res: Response, message: string = 'Bad Gateway', data?: T): Response {
        return this.sendResponse(res, 502, false, message, data);
    }
}