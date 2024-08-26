import { Router } from "express";
import { createUser, deleteUser, getUser, updateUser } from "./user-service";
import { validateRequestBody, validateRequestParams } from "zod-express-middleware";
import { UserIdSchema, UserSchema, UserUpdateRequestSchema } from "./user-schema";
import { z } from "zod";
import { Registry } from "../../openapi";

const usersRouter = Router();

Registry.registerPath({
    method: "post",
    path: "/users",
    summary: "Create a new user",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: UserSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Successfully created user",
            content: {
                "application/json": {
                    schema: UserSchema,
                },
            },
        },
    },
});
usersRouter.post("/", validateRequestBody(UserSchema), (req, res) => {
    const newUser = createUser(req.body);

    res.status(200).json(newUser);
});

Registry.registerPath({
    method: "get",
    path: "/users/{id}",
    summary: "Get a user by id",
    request: {
        params: z.object({
            id: UserIdSchema,
        }),
    },
    responses: {
        200: {
            description: "Successfully retrieved user",
            content: {
                "application/json": {
                    schema: UserSchema,
                },
            },
        },
        400: {
            description: "User not found",
        },
    },
});
usersRouter.get("/:id", validateRequestParams(z.object({ id: UserIdSchema })), (req, res) => {
    const user = getUser(req.params.id);

    if (!user) {
        res.status(404).json({ error: "NotFound", message: "UserNotFound" });
    }

    res.status(200).json(user);
});

Registry.registerPath({
    method: "put",
    path: "/users",
    summary: "Update an existing user",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: UserUpdateRequestSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Successfully updated user",
            content: {
                "application/json": {
                    schema: UserSchema,
                },
            },
        },
    },
});
usersRouter.put("/", validateRequestBody(UserUpdateRequestSchema), (req, res) => {
    const newUser = updateUser(req.body);

    res.status(200).json(newUser);
});

Registry.registerPath({
    method: "delete",
    path: "/users/{id}",
    summary: "Deletes a user by id",
    request: {
        params: z.object({
            id: UserIdSchema,
        }),
    },
    responses: {
        200: {
            description: "Successfully deleted user",
        },
    },
});
usersRouter.delete("/:id", validateRequestParams(z.object({ id: UserIdSchema })), (req, res) => {
    deleteUser(req.params.id);

    res.status(200).send();
});

export default usersRouter;
