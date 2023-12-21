import { createRoute } from "@hono/zod-openapi"
import { authValidationSchema } from "./schema"
import { GenericResponses } from "@/v2/lib/response-schemas"

export const authValidationRoute = createRoute({
    path: "/",
    method: "get",
    description: "Validate current session.",
    tags: ["Auth"],
    responses: {
        200: {
            description: "All user information is returned.",
            content: {
                "application/json": {
                    schema: authValidationSchema,
                },
            },
        },
        ...GenericResponses,
    },
})
