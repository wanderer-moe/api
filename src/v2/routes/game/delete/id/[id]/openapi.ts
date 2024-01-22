import { createRoute } from "@hono/zod-openapi"
import { deleteGameSchema, deleteGameResponse } from "./schema"
import { GenericResponses } from "@/v2/lib/response-schemas"

export const deleteGameRoute = createRoute({
    path: "/{id}",
    method: "delete",
    description: "Delete a game & all its related assets.",
    tags: ["Game"],
    request: {
        params: deleteGameSchema,
    },
    responses: {
        200: {
            description: "Returns boolean indicating success.",
            content: {
                "application/json": {
                    schema: deleteGameResponse,
                },
            },
        },
        ...GenericResponses,
    },
})
