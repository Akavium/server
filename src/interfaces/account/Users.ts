export const userKeys = ['id', 'email', 'number', 'isValid', 'createdAt', 'updatedAt'] as const;
export interface User {
    id: number;
    email: string;
    name?: string | null;
    password: string; // 원래는 이렇게 넣으면 안됨
    number: string;
    isValid: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type UserAutoSetKeys = "id" | "createdAt" | "updatedAt"
export interface UserCreate extends Omit<User, UserAutoSetKeys> { };
export interface UserUpdate extends Partial<UserCreate> { };