import { createRoute } from "@hono/zod-openapi"

export const authAllCurrentSessions = createRoute({
    path: "/",
    method: "get",
    description: "Get all current sessions.",
    tags: ["Auth"],
    responses: {
        200: {
            description: "All current sessions or null is returned.",
        },
        500: {
            description: "Internal server error.",
        },
    },
})
