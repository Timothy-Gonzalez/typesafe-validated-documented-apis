import { User, UserId, UserUpdateRequest } from "./user-schema";

const usersDb: Record<UserId, User> = {};

export function createUser(user: User): User {
    const { id } = user;

    if (usersDb[id]) {
        throw new Error("AlreadyExists");
    }

    usersDb[id] = user;

    return user;
}

export function getUser(id: UserId): User | undefined {
    return usersDb[id];
}

export function deleteUser(id: UserId) {
    if (!usersDb[id]) {
        throw new Error("UserNotFound");
    }

    delete usersDb[id];
}

export function updateUser(request: UserUpdateRequest): User {
    const { id, ...update } = request;
    if (!usersDb[id]) {
        throw new Error("UserNotFound");
    }

    const newUser = {
        ...usersDb[id],
        ...update,
    };

    usersDb[id] = newUser;

    return newUser;
}
