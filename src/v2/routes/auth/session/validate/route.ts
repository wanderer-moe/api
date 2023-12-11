import { OpenAPIHono } from "@hono/zod-openapi"
import { authValidationRoute } from "./openapi"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(authValidationRoute, async (ctx) => {
    const authSessionManager = new AuthSessionManager(ctx)

    const { user } = await authSessionManager.validateSession()

    return ctx.json(
        {
            success: true,
            user: user ? user : null,
        },
        200
    )
})

export default handler
