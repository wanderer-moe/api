import { createRoute } from "@hono/zod-openapi"
import { createGameSchema, createGameResponse } from "./schema"
import { GenericResponses } from "@/v2/lib/response-schemas"

export const createGameRoute = createRoute({
    path: "/",
    method: "post",
    description: "Create a new game.",
    tags: ["Game"],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: createGameSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Returns the new game.",
            content: {
                "application/json": {
                    schema: createGameResponse,
                },
            },
        },
        ...GenericResponses,
    },
})
