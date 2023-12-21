import { createRoute } from "@hono/zod-openapi"
import { loginSchema } from "./schema"
import { z } from "zod"

const loginResponseSchema = z.object({
    success: z.literal(true),
})

export const userLoginRoute = createRoute({
    path: "/",
    method: "post",
    description: "Login to a user with an email and password.",
    tags: ["Auth"],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: loginSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Returns true.",
            content: {
                "application/json": {
                    schema: loginResponseSchema,
                },
            },
        },
        500: {
            description: "Internal server error.",
        },
    },
})
