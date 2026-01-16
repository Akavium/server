import { Router } from "express";
import { isUserUpdate } from "../../../../interfaces/account/Users.guard";
import { catchAsyncErrors } from "../../../../utils/catchAsyncErrors";
import userService from "../../../../services/account/users";
import { ApiResponse } from "../../../../utils/ApiResponse";
import { UserUpdate } from "../../../../interfaces/account/Users";

const userIdRouter = Router({ mergeParams: true });

userIdRouter.get('/', catchAsyncErrors(async (req, res) => {
    const { userId } = req.params;
    const user = await userService.readOne({ id: Number(userId) });
    return ApiResponse.ok(res, user);
}));

userIdRouter.patch('/', catchAsyncErrors(async (req, res) => {
    const { userId } = req.params;
    const data = req.body;
    if (!isUserUpdate(data)) {
        return ApiResponse.badRequest(res, "Invalid data");
    }
    const user = await userService.update({ id: Number(userId) }, data as UserUpdate);
    return ApiResponse.ok(res, user);
}));

userIdRouter.delete('/', catchAsyncErrors(async (req, res) => {
    const { userId } = req.params;
    const user = await userService.delete({ id: Number(userId) });
    return ApiResponse.ok(res, user);
}));

export default userIdRouter;