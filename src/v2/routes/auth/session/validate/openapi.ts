import { createRoute } from "@hono/zod-openapi"

export const authValidationRoute = createRoute({
    path: "/",
    method: "get",
    description: "Validate current session.",
    tags: ["Auth"],
    responses: {
        200: {
            description: "User information or null is returned.",
        },
        500: {
            description: "Internal server error.",
        },
    },
})
