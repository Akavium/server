export interface SuccessApi<T = any> {
    ok: true;
    status: 'success';
    statusCode: number;
    message: string;
    count?: number;
    data: T;
}
/**
 * @summary 에러 응답 인터페이스
 * @description 에러 API 응답의 형식을 정의합니다
 */
export interface ErrorApi {
    ok: false;
    status: 'error';
    statusCode: number;
    message: string;
    count?: undefined;
    data?: undefined;
}
/**
 * @summary API 응답 인터페이스
 */
export type ApiToResponse<T = any> = SuccessApi<T> | ErrorApi;
