import { AppHandler } from "../handler"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "@hono/zod-openapi"
import { selectUserSchema } from "@/v2/db/schema"

const authValidationSchema = z.object({
    success: z.literal(true),
    user: selectUserSchema,
})

const authValidationRoute = createRoute({
    path: "/validate",
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

export const ValidateSessionRoute = (handler: AppHandler) => {
    handler.openapi(authValidationRoute, async (ctx) => {
        const authSessionManager = new AuthSessionManager(ctx)

        const { user } = await authSessionManager.validateSession()

        if (!user) {
            return ctx.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                401
            )
        }

        return ctx.json(
            {
                success: true,
                user,
            },
            200
        )
    })
}
