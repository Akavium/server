import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    /**
     * 요청 로깅 미들웨어
     * @param req - 요청 객체
     * @param res - 응답 객체
     * @param next - 다음 미들웨어
     * @ip - 요청 IP 주소
     * @dateStr - 날짜 문자열
     * @method - 요청 메서드
     * @url - 요청 URL
     * @statusCode - 응답 상태 코드
     * @duration - 요청 처리 시간
     * @browser - 브라우저 정보
     */
    const startTime = Date.now();
    const { method, url, ip } = req;
    const userAgent = req.headers['user-agent'] || 'Unknown';

    res.on("finish", () => {
        const duration = Date.now() - startTime;
        const statusCode = res.statusCode;
        const statusColor = statusCode >= 500 ? '\x1b[31m' :
            statusCode >= 400 ? '\x1b[33m' : '\x1b[32m';

        const date = new Date();
        const dateStr = `${(date.getMonth() + 1).toString().padStart(2, '0')}. ${date.getDate().toString().padStart(2, '0')}. ${date.toLocaleTimeString('ko-KR')}`;

        const browser = userAgent.includes('Chrome') ? 'Chrome' :
            userAgent.includes('Firefox') ? 'Firefox' :
                userAgent.includes('Safari') ? 'Safari' :
                    userAgent.includes('Edge') ? 'Edge' :
                        userAgent.includes('Postman') ? 'Postman' :
                            userAgent.includes('curl') ? 'curl' : 'Unknown';

        console.log(
            `[${ip}] ` +
            `[${dateStr}] ` +
            `${method} ${url} ` +
            `${statusColor}${statusCode}\x1b[0m ` +
            `${duration}ms ` +
            `${browser}`
        );
    });

    next();
};

