import dayjs from "dayjs"
import { Context, MiddlewareHandler } from "hono"

const fakeDomain = "http://fake.wanderer.moe/"

const getRateLimitKey = (ctx: Context) => {
    const ip = ctx.req.header("cf-connecting-ip")
    // TODO(dromzeh): look into setting current user w/ ctx.get/set, then we can use that OVER user ip? idk
    const uniqueKey = ip ?? "unknown"
    return uniqueKey
}

const getCacheKey = (
    endpoint: string,
    key: number | string,
    limit: number,
    interval: number
) => {
    return `${fakeDomain}${endpoint}/${key}/${limit}/${interval}`
}

const setRateLimitHeaders = (
    ctx: Context,
    secondsExpires: number,
    limit: number,
    remaining: number,
    interval: number
) => {
    ctx.header("X-RateLimit-Limit", limit.toString())
    ctx.header("X-RateLimit-Remaining", remaining.toString())
    ctx.header("X-RateLimit-Reset", secondsExpires.toString())
    ctx.header("X-RateLimit-Policy", `rate-limit-${limit}-${interval}`)
}

export const rateLimit = (
    interval: number,
    limit: number
): MiddlewareHandler<{ Bindings: Bindings }> => {
    return async (ctx, next) => {
        const key = getRateLimitKey(ctx)

        const endpoint = new URL(ctx.req.url).pathname

        const id = ctx.env.RATE_LIMITER.idFromName(key)
        const rateLimiter = ctx.env.RATE_LIMITER.get(id)

        const cache = await caches.open("rate-limiter")
        const cacheKey = getCacheKey(endpoint, key, limit, interval)

        const cached = await cache.match(cacheKey)

        let res: Response

        if (!cached) {
            res = await rateLimiter.fetch(
                new Request(fakeDomain, {
                    method: "POST",
                    body: JSON.stringify({
                        scope: endpoint,
                        key,
                        limit,
                        interval,
                    }),
                })
            )
        } else {
            res = cached
        }

        const body = await res.json<{
            blocked: boolean
            remaining: number
            expires: string
        }>()

        const secondsExpires = dayjs(body.expires).unix() - dayjs().unix()

        setRateLimitHeaders(
            ctx,
            secondsExpires,
            limit,
            body.remaining,
            interval
        )

        if (body.blocked) {
            if (!cached) {
                ctx.executionCtx.waitUntil(cache.put(cacheKey, res.clone()))
            }

            return ctx.json(
                {
                    success: false,
                    message:
                        "Rate limit exceeded, contact marcel@dromzeh.dev or reach out to @dromzeh on discord if you're using this API in production and need a higher rate limit.",
                },
                429
            )
        }
        await next()
    }
}
