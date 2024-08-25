import { OpenApiGeneratorV3, OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { readFileSync, watchFile } from "fs";
import path from "path";
import YAML from "yaml";
import swaggerJSDoc from "swagger-jsdoc";

const OPEN_API_SPEC_PATH = path.join(__dirname, "../openapi.yaml");
export const Registry = new OpenAPIRegistry();

let openAPISpec: any | undefined = undefined;

function generateOpenAPISpec() {
    const newSpec = YAML.parse(readFileSync(OPEN_API_SPEC_PATH, "utf8"));
    const paths = (
        swaggerJSDoc({
            definition: {
                openapi: "3.0.0",
                info: newSpec.info,
            },
            apis: [path.join(__dirname, "**/*.js")],
        }) as { paths: object }
    ).paths;
    const generator = new OpenApiGeneratorV3(Registry.definitions);
    const components = generator.generateComponents().components;
    newSpec.paths = paths;
    newSpec.components = components;

    return newSpec;
}

watchFile(OPEN_API_SPEC_PATH, () => {
    if (openAPISpec) {
        openAPISpec = generateOpenAPISpec();
    }
});

export default function getOpenAPISpec() {
    if (!openAPISpec) {
        openAPISpec = generateOpenAPISpec();
    }

    return openAPISpec;
}
