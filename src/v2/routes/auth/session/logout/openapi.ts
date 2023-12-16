import { createRoute } from "@hono/zod-openapi"

export const authLogoutRoute = createRoute({
    path: "/",
    method: "get",
    description: "Logout current session.",
    tags: ["Auth"],
    responses: {
        200: {
            description: "Logout successful.",
        },
        401: {
            description: "Unauthorized",
        },
        500: {
            description: "Internal server error.",
        },
    },
})
