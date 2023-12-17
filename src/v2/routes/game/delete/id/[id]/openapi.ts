import { createRoute } from "@hono/zod-openapi"
import { deleteGameSchema } from "./schema"

export const deleteGameRoute = createRoute({
    path: "/",
    method: "delete",
    description: "Delete a game & all its related assets.",
    tags: ["Game"],
    request: {
        params: deleteGameSchema,
    },
    responses: {
        200: {
            description: "Returns true or false.",
        },
        401: {
            description: "Unauthorized",
        },
        500: {
            description: "Internal server error.",
        },
    },
})
