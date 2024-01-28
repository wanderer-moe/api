import { OpenAPIHono } from "@hono/zod-openapi"
import { apiReference } from "@scalar/hono-api-reference"
import { prettyJSON } from "hono/pretty-json"
import BaseRoutes from "@/v2/routes/handler"
import { CustomCSS, OpenAPIConfig } from "./openapi/config"
import { cors } from "hono/cors"
import { csrf } from "hono/csrf"
import { rateLimit } from "./v2/middleware/ratelimit/limiter"

// this is required for the rate limiter to work
export { RateLimiter } from "@/v2/middleware/ratelimit/ratelimit.do"

const app = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

// v2 API routes
app.route("/v2", BaseRoutes).use("*", rateLimit(60, 100))

app.get(
    "/",
    apiReference({
        spec: {
            url: "/openapi",
        },
        customCss: CustomCSS,
    })
)

// openapi config
app.doc("/openapi", OpenAPIConfig)

app.use("*", csrf())

app.use(
    "*",
    cors({
        // todo(dromzeh): THIS IS TEMPORARY BTW PLEASE SET THIS DEPENDENT ON ENV
        origin: "*",
        credentials: true,
    })
)

app.use("*", prettyJSON())

app.notFound((ctx) => {
    return ctx.json(
        {
            success: false,
            message: "Not Found",
        },
        404
    )
})

app.onError((err, ctx) => {
    console.error(err)
    return ctx.json(
        {
            success: false,
            message: "Internal Server Error",
        },
        500
    )
})

export default app
