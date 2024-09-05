import { RequestHandler } from "express";
import { z, ZodType } from "zod";
import { createDocument, ZodOpenApiOperationObject, ZodOpenApiPathsObject, ZodOpenApiResponsesObject } from "zod-openapi";

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

export interface Specification<Params extends ZodType, Responses extends ResponsesObject, Body extends ZodType> {
    path: string;
    method: "get" | "post" | "put" | "patch" | "delete" | "options" | "head" | "";
    summary: string;
    parameters?: Params;
    body?: Body;
    responses: Responses;
}

// Utility types to convert Responses into a set of possible schemas
type InferResponseBody<T> = T extends ResponseObject ? z.infer<T["schema"]> : never;
type ResponseBody<T extends ResponsesObject> = InferResponseBody<T[keyof T]>;

export function specification<Params extends ZodType, Responses extends ResponsesObject, Body extends ZodType>(
    spec: Specification<Params, Responses, Body>,
): RequestHandler<z.infer<Params>, ResponseBody<Responses>, z.infer<Body>> {
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

    const existing = paths[spec.path];
    paths[spec.path] = {
        ...existing,
        [spec.method]: operation,
    };

    return handler;
}
