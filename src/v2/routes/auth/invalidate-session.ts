import { AppHandler } from "../handler"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"
// import { deleteCookie } from "hono/cookie"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "@hono/zod-openapi"

const paramsSchema = z.object({
    id: z.string().openapi({
        param: {
            description: "The id of the session to invalidate.",
            example: "session_id",
            in: "path",
            name: "id",
            required: true,
        },
    }),
})

const responseSchema = z.object({
    success: z.literal(true),
})

const openRoute = createRoute({
    path: "/invalidate/{id}",
    method: "get",
    summary: "Invalidate a session",
    description: "Invalidate a session by its ID.",
    tags: ["Auth"],
    request: {
        params: paramsSchema,
    },
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

export const InvalidateSessionRoute = (handler: AppHandler) => {
    handler.openapi(openRoute, async (ctx) => {
        const sessionId = ctx.req.valid("param").id

        const authSessionManager = new AuthSessionManager(ctx)

        const { user, session } = await authSessionManager.validateSession()

        if (!user) {
            return ctx.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                401
            )
        }

        if (sessionId == session.id) {
            return ctx.json(
                {
                    success: false,
                    message: "Cannot invalidate the current session.",
                },
                400
            )
        }

        const sessions = await authSessionManager.getAllSessions()

        if (!sessions.find((s) => s.id === sessionId)) {
            return ctx.json(
                {
                    success: false,
                    message: "Session not found.",
                },
                400
            )
        }

        await authSessionManager.invalidateSessionById(sessionId)

        return ctx.json(
            {
                success: true,
            },
            200
        )
    })
}