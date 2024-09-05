# Type-safe, Validated, & Documented APIs

The goal of this repo is to explore several options for creating type-safe, validated, & documented APIs.

Type-safe means working with TypeScript and having proper types (not just any for body).
Validated means rejecting invalid requests that don't match the schema, and validating responses to a certain schema.
Documented means the above are properly documented and in sync with the behavior of the API.

The goal of these three principles is to make an API which robustly handles any request while having up to date documentation.

I chose the openapi format because it is widely supported, and works with Swagger.
Swagger is awesome because is allows for easy testing through their try it feature without something like Postman or Insomniac.

# Options

## Basic

[`basic/`](/basic/)

To start, I created a simple CRUD API that lets you create, read, update, and delete users with express. This has no validation.
However, the docs are nice and easy to use.

## Zod validation

[`zod-validation/`](/zod-validation/)

To add validation, I created zod schemas:
```ts
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
```
These schemas define the structure of objects, and can later be used as validation middleware:
```diff
- usersRouter.post("/", (req, res) => {
+ usersRouter.post("/", validateRequestBody(UserSchema), (req, res) => {
```

Additionally, this provides proper typing:
```ts
typeof req.body == User
```

## Zod schemas to openapi

[`zod-to-openapi/`](/zod-to-openapi/)

Zod is great, but we have our schemas duplicated in code and in `openapi.yaml`. Ideally, we could just use our zod schemas.

Using [`@asteasolutions/zod-to-openapi`](https://www.npmjs.com/package/@asteasolutions/zod-to-openapi), you can put openapi props directly on zod schemas, and then register them as schemas to be referenced.
This allows removing the components section of the openapi spec, and generating it.
Having this section automatically updated makes existing paths easy to update - only the description needs to be updated if needed, the schemas already are from generation.

```diff
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
+ Registry.register("User", UserSchema);
```

However, we still have to manually define our paths, which lets them get out of sync if we're not careful.

## Openapi jsdoc

[`openapi-jsdoc/`](/openapi-jsdoc/)

Right now, our `openapi.yaml` spec is very separate from our code, which makes it easy to not update documentation.
Ideally, we could just include it inline with our routes.

[`swagger-jsdoc`](https://www.npmjs.com/package/swagger-jsdoc) lets us do that:

```ts
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
```

This is apparently quite a popular way to do this, but sucks because you don't get intellisense.

## Openapi register paths

[`openapi-register-paths/`](/openapi-register-paths/)

The more preferable way is to explicitly register them with intellisense, like:

```ts
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
```

This is cleaner than the js approach, but we still have to define this and validation separately.
Also, we don't have typing for the response.

## Express Middleware

[`express-middleware`](/express-middleware/)

Firstly, I found [`zod-openapi`](https://www.npmjs.com/package/zod-openapi) which is a better version of what I was previously using.

I want to combine the above into middleware. This is pushing the scope of express, but it is possible.

This results in a really clean integration:
```ts
usersRouter.get(
    "/:id",
    specification({
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
```

Just a middleware - and typing for params and request.body (I couldn't get response to work reliably for different statuses).
The behind the scenes is a bit more ugly.
This requires hooking into express' internal stack to pull out the path with some cursed regex parsing.
But, it works.

## Better Express Middleware

[`better-express-middleware`](/better-express-middleware/)

We can make the middleware better by not relying on a hack, and just providing the method and path directly:
```ts
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
```

This also has improved typing for the json response.

## Fastify

[`fastify`](/fastify/)

The root issue here is express.
Express doesn't have great type support for validating requests and responses while having documentation.
You can make it work with hacks (having a middleware that casts the response type), but ultimately express wasn't designed for schema validation.

Fastify, however, has this functionality built in.
It's pretty similar to express, and has functionality to support express middleware along with it's own "plugins".

Here's what a get user can look like:

```ts
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
```

The syntax is super nice, and for successful responses you can just return the response.
Everything is typed strictly, down to the reply based on status code.
So, error handling can be explicitly typed.

## Note on code generation

These solutions are mainly for Code -> OpenAPI.
Traditionally, OpenAPI -> Code generators are more common - define the spec, then write the code.
However, this has the flaw of having to write the specification in json/yaml,
for which the tooling is significantly worse than code & way more explicit - with code we can make it much more clean,
but the spec has to be verbose.
