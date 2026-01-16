import { parseWithTypeGuard } from "postgre-types";
import { UserCreate, UserUpdate } from "./Users";

export const isUserCreate = parseWithTypeGuard<UserCreate>({
    email: {
        type: "string",
        isNull: false,
        pattern: "email",
    },
    name: {
        type: "string",
        isNull: true,
    },
    password: {
        type: "string",
        isNull: false,
        min: 8,
    },
    number: {
        type: "string",
        isNull: false,
        pattern: "phoneKR",
    },
    isValid: {
        type: "boolean",
        isNull: false,
    }
});

export const isUserUpdate = parseWithTypeGuard<UserUpdate>({
    email: {
        type: "string",
        isNull: true,
        pattern: "email",
    },
    name: {
        type: "string",
        isNull: true,
    },
    password: {
        type: "string",
        isNull: true,
        min: 8,
    },
    number: {
        type: "string",
        isNull: true,
        pattern: "phoneKR",
    },
    isValid: {
        type: "boolean",
        isNull: true,
    }
});