import { Router } from "express";
import { createUser, deleteUser, getUser, updateUser } from "./user-service";
import { validateRequestBody, validateRequestParams } from "zod-express-middleware";
import { UserIdSchema, UserSchema, UserUpdateRequestSchema } from "./user-schema";
import { z } from "zod";

const usersRouter = Router();

/**
 * @openapi
 * paths:
 *   /users:
 *     post:
 *       summary: Create a new user
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/User"
 *       responses:
 *         "200":
 *           description: Successfully created user
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: "#/components/schemas/User"
 */
usersRouter.post("/", validateRequestBody(UserSchema), (req, res) => {
    const newUser = createUser(req.body);

    res.status(200).json(newUser);
});

/**
 * @openapi
 * paths:
 *   /users/{id}:
 *     get:
 *       summary: Get a user by id
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             $ref: "#/components/schemas/UserId"
 *           description: The id of the user to retrieve
 *       responses:
 *         "200":
 *           description: Successfully retrieved user
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: "#/components/schemas/User"
 *         "404":
 *           description: User not found
 */
usersRouter.get("/:id", validateRequestParams(z.object({ id: UserIdSchema })), (req, res) => {
    const user = getUser(req.params.id);

    if (!user) {
        res.status(404).json({ error: "NotFound", message: "UserNotFound" });
    }

    res.status(200).json(user);
});

/**
 * @openapi
 * paths:
 *   /users:
 *     put:
 *       summary: Update an existing user
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/UserUpdateRequest"
 *       responses:
 *         "200":
 *           description: Successfully updated user
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: "#/components/schemas/User"
 */
usersRouter.put("/", validateRequestBody(UserUpdateRequestSchema), (req, res) => {
    const newUser = updateUser(req.body);

    res.status(200).json(newUser);
});

/**
 * @openapi
 * paths:
 *   /users/{id}:
 *     delete:
 *       summary: Delete a user by ID
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             $ref: "#/components/schemas/UserId"
 *           description: The id of the user to delete
 *       responses:
 *         "200":
 *           description: Successfully deleted user
 */
usersRouter.delete("/:id", validateRequestParams(z.object({ id: UserIdSchema })), (req, res) => {
    deleteUser(req.params.id);

    res.status(200).send();
});

export default usersRouter;
