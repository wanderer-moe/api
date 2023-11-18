import { createRoute } from "@hono/zod-openapi"
import { getUsersByNameSchema } from "./schema"

export const searchUsersByUsernameRoute = createRoute({
    path: "/{username}",
    method: "get",
    description: "Search for users by their username.",
    request: {
        params: getUsersByNameSchema,
    },
    responses: {
        200: {
            description: "User(s) were found.",
        },
        500: {
            description: "Internal server error.",
        },
    },
})
