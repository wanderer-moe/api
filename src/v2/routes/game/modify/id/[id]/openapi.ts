import { createRoute } from "@hono/zod-openapi"
import { modifyGameSchema, modifyGameResponseSchema } from "./schema"
import { GenericResponses } from "@/v2/lib/response-schemas"

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
            description: "Returns the game's attributes",
            content: {
                "application/json": {
                    schema: modifyGameResponseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})
