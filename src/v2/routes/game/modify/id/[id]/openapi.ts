import { createRoute } from "@hono/zod-openapi"
import {
    modifyGameSchema,
    modifyGameResponseSchema,
    modifyGamePathSchema,
} from "./schema"
import { GenericResponses } from "@/v2/lib/response-schemas"

export const modifyGameRoute = createRoute({
    path: "/{id}",
    method: "patch",
    description: "Modify an existing game.",
    tags: ["Game"],
    request: {
        params: modifyGamePathSchema,
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
