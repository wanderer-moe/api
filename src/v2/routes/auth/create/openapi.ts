import { createRoute } from "@hono/zod-openapi"
import { createAccountSchema, createAccountResponseSchema } from "./schema"
import { GenericResponses } from "@/v2/lib/response-schemas"

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
        ...GenericResponses,
    },
})
