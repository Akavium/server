import { Request } from "express";
import { PaginationParams } from "../utils/pagination";
import { AdvancedSearchOptions } from "../repository/repository";

declare global {
    namespace Express {
        interface Request extends Request {
            pagination?: PaginationParams;
            search?: AdvancedSearchOptions<any>;
        }
    }
}