import { createRoute } from "@hono/zod-openapi"
import { getUsersByNameSchema, searchUsersByUsernameSchema } from "./schema"
import { GenericResponses } from "@/v2/lib/response-schemas"

export const searchUsersByUsernameRoute = createRoute({
    path: "/{username}",
    method: "get",
    description: "Search for users by their username.",
    tags: ["User"],
    request: {
        params: getUsersByNameSchema,
    },
    responses: {
        200: {
            description: "User(s) were found.",
            content: {
                "application/json": {
                    schema: searchUsersByUsernameSchema,
                },
            },
        },
        ...GenericResponses,
    },
})
