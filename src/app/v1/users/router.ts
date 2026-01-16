import { Router } from "express";
import userService from "../../../services/account/users";
import { ApiResponse } from "../../../utils/ApiResponse";
import { catchAsyncErrors } from "../../../utils/catchAsyncErrors";
import { paginationMiddleware } from "../../../middleware/pagination";
import { searchMiddleware } from "../../../middleware/search";
import { User, UserCreate } from "../../../interfaces/account/Users";
import { isUserCreate } from "../../../interfaces/account/Users.guard";
import userIdRouter from "./[userId]/router";

const usersRouter = Router();

usersRouter.get('/', paginationMiddleware({ limit: 10, page: 1 }), searchMiddleware<User>(['email', 'number'], ['email', 'number']), catchAsyncErrors(async (req, res) => {
    const { page, limit } = req.pagination;
    const search = req.search;
    const users = await userService.read({ isValid: true }, { page: Number(page), limit: Number(limit) }, search);
    return ApiResponse.ok(res, users);
}));

usersRouter.post('/', catchAsyncErrors(async (req, res) => {
    const data = req.body
    if (!isUserCreate(data)) {
        return ApiResponse.badRequest(res, "Invalid data");
    }
    const user = await userService.create(data as UserCreate);
    return ApiResponse.ok(res, user);
}));

usersRouter.use('/:userId', userIdRouter);

export default usersRouter;