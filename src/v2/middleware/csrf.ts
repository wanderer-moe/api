import type { Next } from "hono"
import { verifyRequestOrigin } from "oslo/request"

export async function csrfValidation(ctx: APIContext, next: Next) {
    if (ctx.req.method === "GET") {
        return next()
    }

    const originHeader = ctx.req.header("Origin")
    const hostHeader = ctx.req.header("Host")

    if (
        !originHeader ||
        !hostHeader ||
        !verifyRequestOrigin(originHeader, [hostHeader])
    ) {
        return ctx.json(
            {
                success: false,
                error: "Forbidden",
            },
            403
        )
    }

    return next()
}
