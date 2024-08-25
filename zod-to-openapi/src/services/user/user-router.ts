import { Router } from "express";
import { createUser, deleteUser, getUser, updateUser } from "./user-service";
import { validateRequestBody, validateRequestParams } from "zod-express-middleware";
import { UserIdSchema, UserSchema, UserUpdateRequestSchema } from "./user-schema";
import { z } from "zod";

const usersRouter = Router();

usersRouter.post("/", validateRequestBody(UserSchema), (req, res) => {
    const newUser = createUser(req.body);

    res.status(200).json(newUser);
});

usersRouter.get("/:id", validateRequestParams(z.object({ id: UserIdSchema })), (req, res) => {
    const user = getUser(req.params.id);

    if (!user) {
        res.status(404).json({ error: "NotFound", message: "UserNotFound" });
    }

    res.status(200).json(user);
});

usersRouter.put("/", validateRequestBody(UserUpdateRequestSchema), (req, res) => {
    const newUser = updateUser(req.body);

    res.status(200).json(newUser);
});

usersRouter.delete("/:id", validateRequestParams(z.object({ id: UserIdSchema })), (req, res) => {
    deleteUser(req.params.id);

    res.status(200).send();
});

export default usersRouter;
