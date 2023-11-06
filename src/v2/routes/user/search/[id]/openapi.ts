import { createRoute } from "@hono/zod-openapi"
import { getUserByIdSchema } from "./schema"

export const getUserByIdRoute = createRoute({
    path: "{id}",
    method: "get",
    description: "Get a user by their ID.",
    request: {
        params: getUserByIdSchema,
    },
    responses: {
        200: {
            description: "The user was found.",
        },
        404: {
            description: "The user was not found.",
        },
    },
})
