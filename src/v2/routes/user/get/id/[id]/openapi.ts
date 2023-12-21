import { createRoute } from "@hono/zod-openapi"
import { getUserByIdSchema, getUserByIdResponseSchema } from "./schema"
import { GenericResponses } from "@/v2/lib/response-schemas"

export const getUserByIdRoute = createRoute({
    path: "/{id}",
    method: "get",
    description: "Get a user by their ID.",
    tags: ["User"],
    request: {
        params: getUserByIdSchema,
    },
    responses: {
        200: {
            description: "The user was found.",
            content: {
                "application/json": {
                    schema: getUserByIdResponseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})
