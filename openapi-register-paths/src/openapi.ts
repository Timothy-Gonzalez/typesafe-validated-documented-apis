import { OpenApiGeneratorV3, OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { readFileSync, watchFile } from "fs";
import path from "path";
import YAML from "yaml";

const OPEN_API_SPEC_PATH = path.join(__dirname, "../openapi.yaml");
export const Registry = new OpenAPIRegistry();

let openAPISpec: any | undefined = undefined;

function generateOpenAPISpec() {
    const newSpec = YAML.parse(readFileSync(OPEN_API_SPEC_PATH, "utf8"));
    const generator = new OpenApiGeneratorV3(Registry.definitions);
    const generatedSpec = generator.generateDocument({
        info: newSpec.info,
        openapi: newSpec.openapi,
    });
    newSpec.components = generatedSpec.components;
    newSpec.paths = generatedSpec.paths;

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
