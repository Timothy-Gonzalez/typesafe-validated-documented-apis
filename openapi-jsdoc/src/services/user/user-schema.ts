import { z } from "zod";
import { Registry } from "../../openapi";

export const UserIdSchema = z.string().openapi({
    description: "A id unique to each user",
    example: "1234",
});
export type UserId = z.infer<typeof UserIdSchema>;
Registry.register("UserId", UserIdSchema);

export const UserSchema = z.object({
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
});
export type User = z.infer<typeof UserSchema>;
Registry.register("User", UserSchema);

export const UserUpdateRequestSchema = UserSchema.partial().required({ id: true }).openapi({
    description: "A update request that can update username, display name, or both",
});
export type UserUpdateRequest = z.infer<typeof UserUpdateRequestSchema>;
Registry.register("UserUpdateRequest", UserUpdateRequestSchema);
