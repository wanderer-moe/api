import { createRoute } from "@hono/zod-openapi"
import { createGameSchema } from "./schema"

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
        },
        500: {
            description: "Internal server error.",
        },
    },
})
