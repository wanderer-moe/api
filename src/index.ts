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

app.use("*", rateLimit(60, 100))
app.use("*", csrf({ origin: "*" }))
app.use("*", prettyJSON({ space: 4 }))
app.use(
    "*",
    cors({
        // todo(dromzeh): this should be set dependant on ENV, PROD or DEV w/ next() for context
        origin: "http://localhost:3000",
        credentials: true,
    })
)

// openapi config
app.doc("/openapi", OpenAPIConfig)

app.get(
    "/docs",
    apiReference({
        spec: {
            url: "/openapi",
        },
        customCss: CustomCSS,
    })
)

// v2 API routes
app.route("/v2", BaseRoutes)

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