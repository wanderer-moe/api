import { createRoute } from "@hono/zod-openapi"
import { modifyGameSchema } from "./schema"

export const modifyGameRoute = createRoute({
    path: "/",
    method: "post",
    description: "Modify an existing game.",
    tags: ["Game"],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: modifyGameSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Returns the game's modified attributes.",
        },
        400: {
            description: "Bad request.",
        },
        401: {
            description: "Unauthorized",
        },
        500: {
            description: "Internal server error.",
        },
    },
})
