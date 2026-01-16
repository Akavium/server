export const postKeys = ['id', 'title', 'content', 'createdAt', 'updatedAt'] as const;

export interface Post {
    id: number;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

export type PostAutoSetKeys = "id" | "createdAt" | "updatedAt"
export interface PostCreate extends Omit<Post, PostAutoSetKeys> { }
export interface PostUpdate extends Partial<PostCreate> { }