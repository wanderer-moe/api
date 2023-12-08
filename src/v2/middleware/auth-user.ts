import type { Next } from "hono"
import { luciaAuth } from "@/v2/lib/auth/lucia"
import { getCookie } from "hono/cookie"

export async function setUserVariable(ctx: APIContext, next: Next) {
    const lucia = luciaAuth(ctx.env)

    const sessionId = getCookie(ctx, lucia.sessionCookieName) ?? null

    if (!sessionId) {
        ctx.set("user", null)
        return next()
    }

    const { session, user } = await lucia.validateSession(sessionId)

    if (session && session.fresh) {
        ctx.header(
            "Set-Cookie",
            lucia.createSessionCookie(session.id).serialize(),
            {
                append: true,
            }
        )
    }

    if (!session) {
        ctx.header("Set-Cookie", lucia.createBlankSessionCookie().serialize(), {
            append: true,
        })
    }

    ctx.set("user", user)

    return next()
}
