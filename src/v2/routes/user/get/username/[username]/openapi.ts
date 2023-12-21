import { createRoute } from "@hono/zod-openapi"
import { getUserByNameSchema } from "./schema"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { getUserByNameResponseSchema } from "./schema"

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
            content: {
                "application/json": {
                    schema: getUserByNameResponseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})
