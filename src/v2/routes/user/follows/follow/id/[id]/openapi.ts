import { createRoute } from "@hono/zod-openapi"
import { followUserByIdResponseSchema, followUserByIdSchema } from "./schema"
import { GenericResponses } from "@/v2/lib/response-schemas"

export const followUserByIdRoute = createRoute({
    path: "/{id}",
    method: "post",
    description: "Follow a user from their ID.",
    tags: ["User"],
    request: {
        params: followUserByIdSchema,
    },
    responses: {
        200: {
            description: "True if the user was followed.",
            content: {
                "application/json": {
                    schema: followUserByIdResponseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})
