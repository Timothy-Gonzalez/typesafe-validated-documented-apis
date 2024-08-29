import { RequestHandler, Request, Response, NextFunction, Router } from "express";
import { z, ZodType } from "zod";
import {
    createDocument,
    ZodOpenApiOperationObject,
    ZodOpenApiPathItemObject,
    ZodOpenApiPathsObject,
    ZodOpenApiResponsesObject,
} from "zod-openapi";

let openAPISpec: any | undefined = undefined;

const paths: ZodOpenApiPathsObject = {};

function generateOpenAPISpec() {
    return createDocument({
        openapi: "3.1.0",
        info: {
            title: "Basic",
            version: "0.0.1",
        },
        servers: [{ url: "http://localhost:3000", description: "Local" }],
        paths,
    });
}

export function getOpenAPISpec() {
    if (!openAPISpec) {
        openAPISpec = generateOpenAPISpec();
    }

    return openAPISpec;
}

interface ResponseObject {
    description: string;
    schema: ZodType;
}

interface ResponsesObject {
    default?: ResponseObject;
    [statuscode: `${1 | 2 | 3 | 4 | 5}${string}`]: ResponseObject;
}

export interface Specification<Params extends ZodType, Body extends ZodType> {
    summary?: string;
    parameters?: Params;
    body?: Body;
    responses: ResponsesObject;
}

export function specification<Params extends ZodType, Body extends ZodType>(
    spec: Specification<Params, Body>,
): RequestHandler<z.infer<Params>, any, z.infer<Body>> {
    const handler: RequestHandler = async (req, res, next) => {
        if (spec.body) {
            const result = await spec.body.safeParseAsync(req.body);
            if (!result.success) {
                res.status(400).json({
                    error: "BadRequest",
                    message: "Bad request made - invalid format",
                    validationErrors: result.error.errors,
                });
            }
        }
        next();
    };

    const responses: ZodOpenApiResponsesObject = {};
    for (const [key, value] of Object.entries(spec.responses)) {
        const response = value as unknown as ResponseObject;
        responses[key as any] = {
            description: response.description,
            content: {
                "application/json": {
                    schema: response.schema,
                },
            },
        };
    }
    const operation: ZodOpenApiOperationObject = {
        summary: spec.summary,
        responses,
    };

    if (spec.body) {
        operation.requestBody = {
            content: {
                "application/json": {
                    schema: spec.body,
                },
            },
        };
    }

    if (spec.parameters) {
        operation.requestParams = {
            path: spec.parameters,
        };
    }

    (handler as any).pathSpecification = operation;
    return handler;
}

function parseRegex(regexp: RegExp) {
    return regexp.source.replace("?(?=\\/|$)", "").replaceAll("\\/", "/").replace("^", "");
}

function createPath(prefix: string, route: string) {
    return prefix.concat(route).replaceAll("//", "/");
}

function processStack(router: Router, prefix?: string) {
    if (!prefix) prefix = "";
    for (const layer of router.stack) {
        if (layer.name == "router") {
            const prefix = parseRegex(layer.regexp);
            processStack(layer.handle as Router, prefix);
        } else if (layer.route) {
            let path = createPath(prefix, layer.route.path);
            for (const innerLayer of layer.route.stack) {
                const spec = (innerLayer.handle as any).pathSpecification as ZodOpenApiOperationObject | undefined;
                if (!spec) {
                    continue;
                }

                // Handle parameters
                if (layer.keys) {
                    for (const key of layer.keys) {
                        const keyName = (key as unknown as { name: string }).name;
                        path = path.replace(`:${keyName}`, `{${keyName}}`);
                    }
                }

                // Found path with spec
                paths[path] = {
                    ...paths[path],
                    [innerLayer.method as keyof ZodOpenApiPathItemObject]: spec,
                };

                break;
            }
        }
    }
}

let generated = false;
export function specificationGenerator(req: Request, _res: Response, next: NextFunction) {
    if (!generated) {
        generated = true;
        processStack(req.app._router as Router);
    }

    next();
}
