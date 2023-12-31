import { OpenAPIHono } from "@hono/zod-openapi"
import { apiReference } from "@scalar/hono-api-reference"
import { prettyJSON } from "hono/pretty-json"
import BaseRoutes from "@/v2/routes/handler"
import { CustomCSS, OpenAPIConfig } from "./openapi/config"
import { cors } from "hono/cors"

import { csrfValidation } from "./v2/middleware/csrf"
import { LogTime } from "./v2/middleware/time-taken"

const app = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

app.route("/v2", BaseRoutes)

app.use(
    "*",
    cors({
        // todo(dromzeh): THIS IS TEMPORARY BTW PLEASE SET THIS DEPENDENT ON ENV
        origin: "*",
        credentials: true,
    })
)

app.get(
    "/",
    apiReference({
        spec: {
            url: "/openapi",
        },
        customCss: CustomCSS,
    })
)

app.use("*", csrfValidation)
app.use("*", LogTime)

app.use("*", prettyJSON())

app.doc("/openapi", OpenAPIConfig)

app.onError((err, ctx) => {
    console.error(err)
    // TODO: error logging
    return ctx.json(
        {
            success: false,
            message: "Internal Server Error",
        },
        500
    )
})

export default app
