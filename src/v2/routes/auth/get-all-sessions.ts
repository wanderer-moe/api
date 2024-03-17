import { AppHandler } from "../handler"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { selectSessionSchema } from "@/v2/db/schema"
import { z } from "@hono/zod-openapi"

const sessionListSchema = z.object({
    success: z.literal(true),
    currentSessions: selectSessionSchema
        .pick({
            id: true,
            expiresAt: true,
        })
        .array(),
})

const authAllCurrentSessions = createRoute({
    path: "/sessions",
    method: "get",
    summary: "Get all current sessions",
    description: "Get all current sessions.",
    tags: ["Auth"],
    responses: {
        200: {
            description: "All current sessions are returned",
            content: {
                "application/json": {
                    schema: sessionListSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

export const UserAllCurrentSessionsRoute = (handler: AppHandler) => {
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
}
