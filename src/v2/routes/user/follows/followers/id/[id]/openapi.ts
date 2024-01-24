import { createRoute } from "@hono/zod-openapi"
import {
    viewUserFollowsbyIdSchema,
    viewUserFollowsbyIdOffsetSchema,
    viewUserFollowsbyIdResponseSchema,
} from "./schema"
import { GenericResponses } from "@/v2/lib/response-schemas"

export const viewUserFollowsByIdRoute = createRoute({
    path: "/{id}",
    method: "get",
    description: "View a user's followers from their ID.",
    tags: ["User"],
    request: {
        params: viewUserFollowsbyIdSchema,
        query: viewUserFollowsbyIdOffsetSchema,
    },
    responses: {
        200: {
            description:
                "List of a user's followers. Only 100 showed at a time, use pagination.",
            content: {
                "application/json": {
                    schema: viewUserFollowsbyIdResponseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})
