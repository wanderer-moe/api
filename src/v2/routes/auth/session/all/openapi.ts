import { createRoute } from "@hono/zod-openapi"
import { sessionListSchema } from "./schema"
import { GenericResponses } from "@/v2/lib/response-schemas"

export const authAllCurrentSessions = createRoute({
    path: "/",
    method: "get",
    description: "Get all current sessions.",
    tags: ["Auth"],
    responses: {
        200: {
            description: "All current sessions are returned",
            content: {
                "application/json": {
                    schema: sessionListSchema,
                },
            },
        },
        ...GenericResponses,
    },
})
