import type { Context, Next } from "hono"
import { verifyRequestOrigin } from "oslo/request"

export async function csrfValidation(c: Context, next: Next) {
    if (c.req.method === "GET") {
        return next()
    }

    const originHeader = c.req.header("Origin")
    const hostHeader = c.req.header("Host")

    if (
        !originHeader ||
        !hostHeader ||
        !verifyRequestOrigin(originHeader, [hostHeader])
    ) {
        return c.body(null, 403)
    }

    return next()
}
