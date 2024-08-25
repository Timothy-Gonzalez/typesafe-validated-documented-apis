import { OpenApiGeneratorV3, OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { readFileSync, watchFile } from "fs";
import path from "path";
import YAML from "yaml";

const OPEN_API_SPEC_PATH = path.join(__dirname, "../openapi.yaml");
export const Registry = new OpenAPIRegistry();

let openAPISpec: any | undefined = undefined;

function generateOpenAPISpec() {
    const generator = new OpenApiGeneratorV3(Registry.definitions);
    const components = generator.generateComponents().components;
    const openapiSpec = YAML.parse(readFileSync(OPEN_API_SPEC_PATH, "utf8"));
    openapiSpec.components = components;

    return openapiSpec;
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
