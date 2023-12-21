import { createRoute } from "@hono/zod-openapi"
import { z } from "zod"
import { GenericResponses } from "@/v2/lib/response-schemas"

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
        ...GenericResponses,
    },
})
