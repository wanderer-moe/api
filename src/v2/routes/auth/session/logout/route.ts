import { OpenAPIHono } from "@hono/zod-openapi"
import { authLogoutRoute } from "./openapi"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"
import { deleteCookie } from "hono/cookie"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(authLogoutRoute, async (ctx) => {
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
            message: "Logout successful.",
        },
        200
    )
})

export default handler
