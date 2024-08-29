import { z } from "zod";
import { extendZodWithOpenApi } from "zod-openapi";

extendZodWithOpenApi(z);

import express from "express";
import { getOpenAPISpec, specificationGenerator } from "./openapi";
import swaggerUi from "swagger-ui-express";
import userRouter from "./services/user/user-router";

const app = express();

app.use(express.json());
app.use(specificationGenerator);

app.use("/users/", userRouter);

app.use("/docs/json", (_req, res) => res.json(getOpenAPISpec()));
app.use(
    "/docs",
    swaggerUi.serveFiles(undefined, {
        swaggerUrl: "/docs/json",
    }),
    swaggerUi.setup(undefined, {
        swaggerUrl: "/docs/json",
    }),
);

const PORT = 3000 || process.env.PORT;
app.listen(PORT);

console.log(`Listening on http://localhost:${PORT}...`);
