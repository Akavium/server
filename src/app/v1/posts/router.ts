import { Router } from "express";
import { catchAsyncErrors } from "../../../utils/catchAsyncErrors";
import { ApiResponse } from "../../../utils/ApiResponse";
import postService from "../../../services/post/posts";
import { paginationMiddleware } from "../../../middleware/pagination";
import { searchMiddleware } from "../../../middleware/search";
import { Post } from "../../../interfaces/post/Posts";
import { isPostCreate } from "../../../interfaces/post/Posts.guard";
import postIdRouter from "./[postId]/router";
import { PostCreate } from "../../../interfaces/post/Posts";

const postsRouter = Router();

postsRouter.get('/', paginationMiddleware({ limit: 10, page: 1 }), searchMiddleware<Post>(['title', 'content'], ['title', 'content']), catchAsyncErrors(async (req, res) => {
    const { page, limit } = req.pagination;
    const search = req.search;
    const posts = await postService.read(undefined, { page: Number(page), limit: Number(limit) }, search);
    return ApiResponse.ok(res, posts);
}));

postsRouter.post('/', catchAsyncErrors(async (req, res) => {
    const data = req.body;
    if (!isPostCreate(data)) {
        return ApiResponse.badRequest(res, "Invalid data");
    }
    const post = await postService.create(data as PostCreate);
    return ApiResponse.ok(res, post);
}));

postsRouter.use('/:postId', postIdRouter);

export default postsRouter;