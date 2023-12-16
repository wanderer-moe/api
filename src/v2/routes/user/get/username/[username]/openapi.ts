import { createRoute } from "@hono/zod-openapi"
import { getUserByNameSchema } from "./schema"

export const getUserByNameRoute = createRoute({
    path: "/{username}",
    method: "get",
    description: "Get a user by their exact username.",
    tags: ["User"],
    request: {
        params: getUserByNameSchema,
    },
    responses: {
        200: {
            description: "The user was found.",
        },
        500: {
            description: "Internal server error.",
        },
    },
})