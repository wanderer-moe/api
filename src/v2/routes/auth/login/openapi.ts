import { createRoute } from "@hono/zod-openapi"
import { loginSchema } from "./schema"

export const userLoginRoute = createRoute({
    path: "/",
    method: "post",
    description: "Login to a user with an email and password.",
    tags: ["Auth"],
    request: {
        body: {
            description: "The email and password of the user.",
            content: {
                "application/json": {
                    schema: loginSchema,
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
