import { createRoute } from "@hono/zod-openapi"
import { selectUserSchema } from "@/v2/db/schema"
import { z } from "zod"

const authValidationSchema = z.object({
    success: z.literal(true),
    user: selectUserSchema,
})

export const authValidationRoute = createRoute({
    path: "/",
    method: "get",
    description: "Validate current session.",
    tags: ["Auth"],
    responses: {
        200: {
            description: "User information is returned.",
            content: {
                "application/json": {
                    schema: authValidationSchema,
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
