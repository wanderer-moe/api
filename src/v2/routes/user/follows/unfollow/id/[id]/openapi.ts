import { createRoute } from "@hono/zod-openapi"
import {
    unfollowUserByIdResponseSchema,
    unfollowUserByIdSchema,
} from "./schema"
import { GenericResponses } from "@/v2/lib/response-schemas"

export const unFollowUserByIdRoute = createRoute({
    path: "/{id}",
    method: "post",
    description: "Follow a user from their ID.",
    tags: ["User"],
    request: {
        params: unfollowUserByIdSchema,
    },
    responses: {
        200: {
            description: "True if the user was unfollowed.",
            content: {
                "application/json": {
                    schema: unfollowUserByIdResponseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})
