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
    });
export type User = z.infer<typeof UserSchema>;

export const UserUpdateRequestSchema = UserSchema.partial().required({ id: true }).openapi({
    ref: "UserUpdateRequest",
    description: "A update request that can update username, display name, or both",
});
export type UserUpdateRequest = z.infer<typeof UserUpdateRequestSchema>;

export const UserNotFoundErrorSchema = z.object({ error: z.literal("NotFound"), message: z.literal("UserNotFound") });
