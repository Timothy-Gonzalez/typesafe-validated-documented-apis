import { z } from "zod";

export const UserIdSchema = z.string().openapi({
    ref: "UserId",
    description: "A id unique to each user",
    example: "1234",
});
export type UserId = z.infer<typeof UserIdSchema>;

export const UserSchema = z
    .object({
        id: UserIdSchema,
        userName: z
            .string()
            .min(1)
            .max(20)
            .regex(/^[a-z0-9]+$/, "Username must be alphanumeric")
            .openapi({
                description: "The user's username, which must be alphanumeric",
                example: "username1",
            }),
        displayName: z.string().min(1).max(50).openapi({
            description: "The user's display name, with no limitations on characters allowed",
            example: "1 Full Display Name",
        }),
    })
    .openapi({
        ref: "User",
        description: "A user",
    });
export type User = z.infer<typeof UserSchema>;

export interface APIError {
    error: string;
    message: string;
}

export const UserNotFoundError = {
    error: "NotFound" as const,
    message: "User not found" as const,
};

export const UserNotFoundErrorSchema = z
    .object({
        error: z.literal(UserNotFoundError.error),
        message: z.literal(UserNotFoundError.message),
    })
    .openapi({
        description: UserNotFoundError.message,
    });

export const UserUpdateRequestSchema = UserSchema.partial().required({ id: true }).openapi({
    ref: "UserUpdateRequest",
    description: "A update request that can update username, display name, or both",
});
export type UserUpdateRequest = z.infer<typeof UserUpdateRequestSchema>;
