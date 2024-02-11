import { createRoute } from "@hono/zod-openapi"
import { viewAllRequestsResponseSchema, viewAllRequestsSchema } from "./schema"
import { GenericResponses } from "@/v2/lib/response-schemas"

export const getAllRequestsRoute = createRoute({
    path: "/",
    method: "get",
    description:
        "Get all requests. This will also return all associated upvotes count.",
    tags: ["Requests"],
    request: {
        query: viewAllRequestsSchema,
    },
    responses: {
        200: {
            description: "List of all submitted requests.",
            content: {
                "application/json": {
                    schema: viewAllRequestsResponseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})
