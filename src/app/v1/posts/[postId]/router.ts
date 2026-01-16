import { Router } from "express";
import { catchAsyncErrors } from "../../../../utils/catchAsyncErrors";
import { ApiResponse } from "../../../../utils/ApiResponse";
import postService from "../../../../services/post/posts";
import { isPostUpdate } from "../../../../interfaces/post/Posts.guard";
import { PostUpdate } from "../../../../interfaces/post/Posts";

const postIdRouter = Router({ mergeParams: true });

postIdRouter.get('/', catchAsyncErrors(async (req, res) => {
    const { postId } = req.params;
    const post = await postService.readOne({ id: Number(postId) });
    return ApiResponse.ok(res, post);
}));

postIdRouter.patch('/', catchAsyncErrors(async (req, res) => {
    const { postId } = req.params;
    const data = req.body;
    if (!isPostUpdate(data)) {
        return ApiResponse.badRequest(res, "Invalid data");
    }
    const post = await postService.update({ id: Number(postId) }, data as PostUpdate);
    return ApiResponse.ok(res, post);
}));

postIdRouter.delete('/', catchAsyncErrors(async (req, res) => {
    const { postId } = req.params;
    const post = await postService.delete({ id: Number(postId) });
    return ApiResponse.ok(res, post);
}));

export default postIdRouter;