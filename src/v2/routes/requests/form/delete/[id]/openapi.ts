import { createRoute } from "@hono/zod-openapi"
import {
    deleteRequestByIdResponseSchema,
    deleteRequestByIdSchema,
} from "./schema"
import { GenericResponses } from "@/v2/lib/response-schemas"

export const deleteRequestByIdRoute = createRoute({
    path: "/{id}",
    method: "delete",
    description:
        "Delete a request by its ID. This will also delete all associated upvotes.",
    tags: ["Requests"],
    request: {
        params: deleteRequestByIdSchema,
    },
    responses: {
        200: {
            description: "True if the request was deleted successfully.",
            content: {
                "application/json": {
                    schema: deleteRequestByIdResponseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})
