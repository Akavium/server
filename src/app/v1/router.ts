import { Router, Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import { catchAsyncErrors } from "postgre-pagination";
import usersRouter from "./users/router";
import postsRouter from "./posts/router";

const route = Router({ mergeParams: true });

route.get('/', catchAsyncErrors(async (req: Request, res: Response) => {
    console.log("Akavium V1 is running");
    return ApiResponse.ok(res, "Akavium V1 is running");
}));

route.use('/users', usersRouter);
route.use('/posts', postsRouter);

export default route;