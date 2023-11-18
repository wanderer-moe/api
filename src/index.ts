import { OpenAPIHono } from "@hono/zod-openapi"
import { swaggerUI } from "@hono/swagger-ui"
import { prettyJSON } from "hono/pretty-json"
import BaseRoutes from "@/v2/routes/handler"

const app = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

app.route("/v2", BaseRoutes)

app.doc("/openapi", {
    openapi: "3.1.0",
    info: {
        version: "2.0.0",
        title: "api.wanderer.moe",
        description: "Public Zod OpenAPI documentation for wanderer.moe's API.",
        license: {
            name: "GNU General Public License v3.0",
            url: "https://www.gnu.org/licenses/gpl-3.0.en.html",
        },
        contact: {
            url: "https://wanderer.moe",
            name: "wanderer.moe",
        },
    },
})

app.get(
    "/docs",
    swaggerUI({
        url: "/openapi",
    })
)

app.use("*", async (ctx, next) => {
    const start = Date.now()
    await next()
    const ms = Date.now() - start
    ctx.res.headers.set("X-Response-Time", `${ms}ms`)
})

app.use("*", prettyJSON())

export default app
