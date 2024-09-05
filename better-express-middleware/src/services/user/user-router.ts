import { createUser, deleteUser, getUser, updateUser } from "./user-service";
import { UserIdSchema, UserNotFoundErrorSchema, UserSchema, UserUpdateRequestSchema } from "./user-schema";
import { z } from "zod";
import { specification } from "../../openapi";
import { Router } from "express";

const usersRouter = Router();

usersRouter.post(
    "/",
    specification({
        method: "post",
        path: "/user/",
        summary: "Create a new user",
        body: UserSchema,
        responses: {
            200: {
                description: "Successfully created user",
                schema: UserSchema,
            },
        },
    }),
    (req, res) => {
        const newUser = createUser(req.body);

        res.status(200).json(newUser);
    },
);

usersRouter.get(
    "/:id",
    specification({
        method: "get",
        path: "/user/{id}/",
        summary: "Get a user by id",
        parameters: z.object({
            id: UserIdSchema,
        }),
        responses: {
            200: {
                description: "Successfully got user",
                schema: UserSchema,
            },
            400: {
                description: "User not found",
                schema: UserNotFoundErrorSchema,
            },
        },
    }),
    (req, res) => {
        const user = getUser(req.params.id);

        if (!user) {
            res.status(404).json({ error: "NotFound", message: "UserNotFound" });
        }

        res.status(200).json(user);
    },
);

usersRouter.put(
    "/",
    specification({
        method: "put",
        path: "/user/",
        summary: "Update an existing user",
        body: UserUpdateRequestSchema,
        responses: {
            200: {
                description: "Successfully updated user",
                schema: UserSchema,
            },
        },
    }),
    (req, res) => {
        const newUser = updateUser(req.body);

        res.status(200).json(newUser);
    },
);

usersRouter.delete(
    "/:id",
    specification({
        method: "delete",
        path: "/user/{id}/",
        summary: "Delete a user by id",
        parameters: z.object({
            id: UserIdSchema,
        }),
        responses: {
            200: {
                description: "Successfully deleted user",
                schema: z.object({}),
            },
        },
    }),
    (req, res) => {
        deleteUser(req.params.id);

        res.status(200).send();
    },
);

export default usersRouter;
