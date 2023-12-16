import { OpenAPIHono } from "@hono/zod-openapi"
import { authAllCurrentSessions } from "./openapi"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(authAllCurrentSessions, async (ctx) => {
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

    const sessions = await authSessionManager.getAllSessions()

    return ctx.json(
        {
            success: true,
            currentSessions: sessions.map((session) => {
                return {
                    id: session.id,
                    expiresAt: session.expiresAt.toISOString(),
                    userAgent: session.userAgent,
                }
            }),
        },
        200
    )
})

export default handler
