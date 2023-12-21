import { createRoute } from "@hono/zod-openapi"
import { z } from "zod"

const logoutResponseSchema = z.object({
    success: z.literal(true),
})

export const authLogoutRoute = createRoute({
    path: "/",
    method: "get",
    description: "Logout current session.",
    tags: ["Auth"],
    responses: {
        200: {
            description: "Logout successful.",
            content: {
                "application/json": {
                    schema: logoutResponseSchema,
                },
            },
        },
        401: {
            description: "Unauthorized",
        },
        500: {
            description: "Internal server error.",
        },
    },
})
