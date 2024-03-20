import { AppHandler } from "../handler"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"
import { deleteCookie } from "hono/cookie"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "@hono/zod-openapi"

const responseSchema = z.object({
    success: z.literal(true),
})

const openRoute = createRoute({
    path: "/logout",
    method: "get",
    summary: "Logout",
    description: "Logout current session.",
    tags: ["Auth"],
    responses: {
        200: {
            description: "Logout successful.",
            content: {
                "application/json": {
                    schema: responseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

export const LogoutCurrentSessionRoute = (handler: AppHandler) => {
    handler.openapi(openRoute, async (ctx) => {
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

        await authSessionManager.invalidateCurrentSession()

        deleteCookie(ctx, "user_auth_session")

        return ctx.json(
            {
                success: true,
            },
            200
        )
    })
}
