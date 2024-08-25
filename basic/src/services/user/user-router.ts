import { Router } from "express";
import { createUser, deleteUser, getUser, updateUser } from "./user-service";

const usersRouter = Router();

usersRouter.post("/", (req, res) => {
    const newUser = createUser(req.body);

    res.status(200).json(newUser);
});

usersRouter.get("/:id", (req, res) => {
    const user = getUser(req.params.id);

    if (!user) {
        res.status(404).json({ error: "NotFound", message: "UserNotFound" });
    }

    res.status(200).json(user);
});

usersRouter.put("/", (req, res) => {
    const newUser = updateUser(req.body);

    res.status(200).json(newUser);
});

usersRouter.delete("/:id", (req, res) => {
    deleteUser(req.params.id);

    res.status(200).send();
});

export default usersRouter;
