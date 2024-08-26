import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

import express from "express";
import userRouter from "./services/user/user-router";
import swaggerUi from "swagger-ui-express";
import getOpenAPISpec from "./openapi";

const app = express();

app.use(express.json());

app.use("/users/", userRouter);

app.use("/docs/openapi.json", (_req, res) => res.json(getOpenAPISpec()));
app.use(
    "/docs",
    swaggerUi.serveFiles(undefined, {
        swaggerUrl: "/docs/openapi.json",
    }),
    swaggerUi.setup(undefined, {
        swaggerUrl: "/docs/openapi.json",
    }),
);

const PORT = 3000 || process.env.PORT;
app.listen(PORT);

console.log(`Listening on http://localhost:${PORT}...`);
