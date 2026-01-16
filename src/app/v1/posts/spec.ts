import { Tspec } from "tspec";
import { Post } from "../../../interfaces/post/Posts";
import { PostCreate, PostUpdate } from "../../../interfaces/post/Posts";

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

export type V1PostsApiSpec = Tspec.DefineApiSpec<{
    tags: ["Posts API"];
    paths: {
        "/v1/posts": {
            get: {
                summary: "게시물 목록 조회";
                description: "게시물 목록을 조회합니다";
                responses: {
                    200: SuccessApi<Post[]>;
                    401: ErrorApi;
                };
            };
            post: {
                summary: "게시물 생성";
                description: "게시물을 생성합니다";
                body: PostCreate;
                responses: {
                    201: SuccessApi<Post>;
                    400: ErrorApi;
                    401: ErrorApi;
                };
            };
        };
        "/v1/posts/{postId}": {
            get: {
                summary: "게시물 상세 조회";
                description: "특정 게시물의 상세 정보를 조회합니다";
                path: {
                    postId: string;
                };
                responses: {
                    200: SuccessApi<Post>;
                    401: ErrorApi;
                    404: ErrorApi;
                };
            };
            patch: {
                summary: "게시물 수정";
                description: "게시물 정보를 수정합니다";
                path: {
                    postId: string;
                };
                body: PostUpdate;
                responses: {
                    200: SuccessApi<Post>;
                    400: ErrorApi;
                    401: ErrorApi;
                };
            };
            delete: {
                summary: "게시물 삭제";
                description: "게시물을 삭제합니다";
                path: {
                    postId: string;
                };
                responses: {
                    200: SuccessApi<Post>;
                    401: ErrorApi;
                    404: ErrorApi;
                };
            };
        };
    };
}>;
