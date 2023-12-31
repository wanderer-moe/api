import type { Next } from "hono"
import { verifyRequestOrigin } from "oslo/request"

export async function csrfValidation(ctx: APIContext, next: Next) {
    if (ctx.req.method === "GET") {
        return next()
    }

    const originHeader = ctx.req.header("Origin")
    const hostHeader = ctx.req.header("Host")

    const requestOriginValid = verifyRequestOrigin(originHeader, [hostHeader])

    if (!originHeader || !hostHeader || !requestOriginValid) {
        return ctx.json(
            {
                success: false,
                message: "Forbidden (CSRF)",
            },
            403
        )
    }

    return next()
}
