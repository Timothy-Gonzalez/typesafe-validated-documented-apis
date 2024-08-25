import express from "express";
import userRouter from "./services/user/user-router";
import swaggerUi from "swagger-ui-express";
import YAML from "yaml";
import { readFileSync, watchFile } from "fs";
import path from "path";

const app = express();

app.use(express.json());

app.use("/users/", userRouter);

const OPEN_API_SPEC_PATH = path.join(__dirname, "../openapi.yaml");
let openAPISpec = YAML.parse(readFileSync(OPEN_API_SPEC_PATH, "utf8"));
watchFile(OPEN_API_SPEC_PATH, () => {
    openAPISpec = YAML.parse(readFileSync(OPEN_API_SPEC_PATH, "utf8"));
});
app.use("/docs/openapi.json", (_req, res) => res.json(openAPISpec));
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
