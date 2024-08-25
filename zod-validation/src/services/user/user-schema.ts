import { z } from "zod";

export const UserIdSchema = z.string();
export type UserId = z.infer<typeof UserIdSchema>;

export const UserSchema = z.object({
    id: UserIdSchema,
    userName: z
        .string()
        .min(1)
        .max(20)
        .regex(/^[a-z0-9]+$/, "Username must be alphanumeric"),
    displayName: z.string().min(1).max(50),
});
export type User = z.infer<typeof UserSchema>;

export const UserUpdateRequestSchema = UserSchema.partial().required({ id: true });
export type UserUpdateRequest = z.infer<typeof UserUpdateRequestSchema>;
