import { Router, Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import { catchAsyncErrors } from "postgre-pagination";
import v1Router from "./v1/router";

const router = Router({ mergeParams: true });

router.get('/', catchAsyncErrors(async (req: Request, res: Response) => {
    console.log("Akavium Server is running");
    return ApiResponse.ok(res, "Akavium Server is running");
}));

router.use("/v1", v1Router);

export default router;
