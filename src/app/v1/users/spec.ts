import { Tspec } from "tspec";
import { User } from "../../../interfaces/account/Users";
import { UserCreate, UserUpdate } from "../../../interfaces/account/Users";

export interface SuccessApi<T = any> {
    ok: true;
    status: 'success';
    statusCode: number;
    message: string;
    count?: number;
    data: T;
}

export interface ErrorApi {
    ok: false;
    status: 'error';
    statusCode: number;
    message: string;
    count?: undefined;
    data?: undefined;
}

export type V1UsersApiSpec = Tspec.DefineApiSpec<{
    tags: ["Users API"];
    paths: {
        "/v1/users": {
            get: {
                summary: "사용자 목록 조회";
                description: "사용자 목록을 조회합니다";
                responses: {
                    200: SuccessApi<User[]>;
                    401: ErrorApi;
                };
            };
            post: {
                summary: "사용자 생성";
                description: "사용자를 생성합니다";
                body: UserCreate;
                responses: {
                    201: SuccessApi<User>;
                    400: ErrorApi;
                    401: ErrorApi;
                };
            };
        };
        "/v1/users/{userId}": {
            get: {
                summary: "사용자 상세 조회";
                description: "특정 사용자의 상세 정보를 조회합니다";
                path: {
                    userId: string;
                };
                responses: {
                    200: SuccessApi<User>;
                    401: ErrorApi;
                    404: ErrorApi;
                };
            };
            patch: {
                summary: "사용자 수정";
                description: "사용자 정보를 수정합니다";
                path: {
                    userId: string;
                };
                body: UserUpdate;
                responses: {
                    200: SuccessApi<User>;
                    400: ErrorApi;
                    401: ErrorApi;
                };
            };
            delete: {
                summary: "사용자 삭제";
                description: "사용자를 삭제합니다";
                path: {
                    userId: string;
                };
                responses: {
                    200: SuccessApi<User>;
                    401: ErrorApi;
                    404: ErrorApi;
                };
            };
        };
    };
}>;
