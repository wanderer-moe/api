import type { Context, Next } from "hono"
import { auth } from "@/v2/lib/auth/lucia"
import { getCookie } from "hono/cookie"

export async function setUserVariable(c: Context, next: Next) {
    const setAuth = auth(c.env)

    const sessionId = getCookie(c, setAuth.sessionCookieName) ?? null

    if (!sessionId) {
        c.set("user", null)
        return next()
    }

    const { session, user } = await setAuth.validateSession(sessionId)

    if (session && session.fresh) {
        c.header(
            "Set-Cookie",
            setAuth.createSessionCookie(session.id).serialize(),
            {
                append: true,
            }
        )
    }

    if (!session) {
        c.header("Set-Cookie", setAuth.createBlankSessionCookie().serialize(), {
            append: true,
        })
    }

    c.set("user", user)
    return next()
}
