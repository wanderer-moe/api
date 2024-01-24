import { createRoute } from "@hono/zod-openapi"
import {
    viewUserfollowingbyIdSchema,
    viewUserfollowingbyIdResponseSchema,
    viewUserFollowingOffsetSchema,
} from "./schema"
import { GenericResponses } from "@/v2/lib/response-schemas"

export const viewUserfollowingbyIdRoute = createRoute({
    path: "/{id}",
    method: "get",
    description: "View who a user's following from their ID.",
    tags: ["User"],
    request: {
        params: viewUserfollowingbyIdSchema,
        query: viewUserFollowingOffsetSchema,
    },
    responses: {
        200: {
            description:
                "List of who a user's following. Only 100 showed at a time, use pagination.",
            content: {
                "application/json": {
                    schema: viewUserfollowingbyIdResponseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})
