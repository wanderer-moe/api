import { createRoute } from "@hono/zod-openapi"

export const authValidationRoute = createRoute({
    path: "/",
    method: "get",
    description: "Validate current session.",
    tags: ["Auth"],
    responses: {
        200: {
            description: "User information is returned.",
        },
        401: {
            description: "Unauthorized",
        },
        500: {
            description: "Internal server error.",
        },
    },
})
