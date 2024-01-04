import type { Next } from "hono"
import { verifyRequestOrigin } from "oslo/request"

// TODO(dromzeh): i will probably go back and generate a csrf token for every request
// but for now, i'm just gonna use the request origin header to verify the request
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
