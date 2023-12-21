import { createRoute } from "@hono/zod-openapi"
import { loginSchema } from "./schema"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { loginResponseSchema } from "./schema"

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
        ...GenericResponses,
    },
})
