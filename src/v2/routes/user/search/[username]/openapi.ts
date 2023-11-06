import { createRoute } from "@hono/zod-openapi"
import { getUserByNameSchema } from "./schema"

export const getUserByNameRoute = createRoute({
    path: "/{username}",
    method: "get",
    description: "Get a user by their username.",
    request: {
        params: getUserByNameSchema,
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
