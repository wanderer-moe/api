import { createRoute } from "@hono/zod-openapi"
import { createAccountSchema } from "./schema"

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
            description: "Returns the user object or null.",
        },
        500: {
            description: "Internal server error.",
        },
    },
})
