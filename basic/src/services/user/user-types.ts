export type UserId = string;
export interface User {
    id: UserId;
    userName: string;
    displayName: string;
}
export interface UserUpdateRequest {
    id: string;
    userName?: string;
    displayName?: string;
}
