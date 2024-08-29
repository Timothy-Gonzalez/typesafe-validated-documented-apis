import { createUser, deleteUser, getUser, updateUser } from "./user-service";
import { UserIdSchema, UserNotFoundError, UserNotFoundErrorSchema, UserSchema, UserUpdateRequestSchema } from "./user-schema";
import { FastifyPluginAsyncZodOpenApi } from "fastify-zod-openapi";
import { z } from "zod";

const userRoutes: FastifyPluginAsyncZodOpenApi = async (app, _ops) => {
    app.post(
        "/",
        {
            schema: {
                description: "Create a new user",
                body: UserSchema,
                response: {
                    200: UserSchema.openapi({
                        description: "Successfully created user",
                    }),
                },
            },
        },
        (req, _reply) => {
            return createUser(req.body);
        },
    );

    app.get(
        "/:id",
        {
            schema: {
                description: "Get a user by id",
                params: z.object({
                    id: UserIdSchema,
                }),
                response: {
                    200: UserSchema.openapi({
                        description: "Successfully got user",
                    }),
                    404: UserNotFoundErrorSchema,
                },
            },
        },
        (req, reply) => {
            const user = getUser(req.params.id);

            if (!user) {
                reply.status(404).send(UserNotFoundError);
            }

            return user;
        },
    );

    app.put(
        "/",
        {
            schema: {
                description: "Update an existing user",
                body: UserUpdateRequestSchema,
                response: {
                    200: UserUpdateRequestSchema.openapi({
                        description: "Successfully updated user",
                    }),
                },
            },
        },
        (req, _reply) => {
            const newUser = updateUser(req.body);

            return newUser;
        },
    );

    app.delete(
        "/:id",
        {
            schema: {
                params: z.object({
                    id: UserIdSchema,
                }),
                response: {
                    200: z.object({}).openapi({
                        description: "Successfully deleted user",
                    }),
                },
            },
        },
        (req, reply) => {
            deleteUser(req.params.id);

            reply.status(200).send({});
        },
    );
};

export default userRoutes;
