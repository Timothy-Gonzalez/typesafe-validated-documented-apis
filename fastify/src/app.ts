import { z } from "zod";
import { extendZodWithOpenApi } from "zod-openapi";

extendZodWithOpenApi(z);

import userRoutes from "./services/user/user-routes";
import fastify from "fastify";
import {
    fastifyZodOpenApiPlugin,
    fastifyZodOpenApiTransform,
    fastifyZodOpenApiTransformObject,
    FastifyZodOpenApiTypeProvider,
    serializerCompiler,
    validatorCompiler,
} from "fastify-zod-openapi";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";

async function createApp() {
    const app = fastify({
        logger: true,
    }).withTypeProvider<FastifyZodOpenApiTypeProvider>();

    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);

    const openapi = "3.1.0";

    await app.register(fastifyZodOpenApiPlugin, { openapi });

    await app.register(fastifySwagger, {
        openapi: {
            openapi,
            info: {
                title: "Basic",
                version: "0.0.1",
            },
            servers: [{ url: "http://localhost:3000", description: "Local" }],
        },
        transform: fastifyZodOpenApiTransform,
        transformObject: fastifyZodOpenApiTransformObject,
    });
    await app.register(fastifySwaggerUi, {
        routePrefix: "/docs",
    });

    await app.register(userRoutes, {
        prefix: "/users",
    });

    return app;
}

const start = async () => {
    const app = await createApp();
    try {
        const port = 3000 || process.env.PORT;
        await app.listen({ port });
        console.log(`Listening on http://localhost:${port}...`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};
start();
