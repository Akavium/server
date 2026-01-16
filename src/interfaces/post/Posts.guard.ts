import { parseWithTypeGuard } from "postgre-types";
import { PostCreate, PostUpdate } from "./Posts";

export const isPostCreate = parseWithTypeGuard<PostCreate>({
    title: {
        type: "string",
        isNull: false,
    },
    content: {
        type: "string",
        isNull: false,
    },
});

export const isPostUpdate = parseWithTypeGuard<PostUpdate>({
    title: {
        type: "string",
        isNull: true,
    },
    content: {
        type: "string",
        isNull: true,
    },
});