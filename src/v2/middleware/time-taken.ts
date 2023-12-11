import type { Next } from "hono"

export async function LogTime(ctx: APIContext, next: Next): Promise<void> {
    const start = Date.now()
    await next()
    ctx.res.headers.set("x-response-time", `${Date.now() - start}ms`)
}
