import { createRoute } from "@hono/zod-openapi"
import { createAccountSchema } from "./schema"
import { z } from "zod"

const createAccountResponseSchema = z.object({
    success: z.literal(true),
})

export const userCreateAccountRoute = createRoute({
    path: "/",
    method: "post",
    description: "Create a new user account with an email and password.",
    tags: ["Auth"],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: createAccountSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Returns true.",
            content: {
                "application/json": {
                    schema: createAccountResponseSchema,
                },
            },
        },
        500: {
            description: "Internal server error.",
        },
    },
})
