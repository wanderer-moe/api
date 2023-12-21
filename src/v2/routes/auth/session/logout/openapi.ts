import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { logoutResponseSchema } from "./schema"

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
