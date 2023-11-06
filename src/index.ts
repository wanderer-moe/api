import { OpenAPIHono } from "@hono/zod-openapi"
import { swaggerUI } from "@hono/swagger-ui"
import { prettyJSON } from "hono/pretty-json"
import BaseRoutes from "@/v2/routes/route"

const app = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

app.route("/v2", BaseRoutes)

app.doc("/openapi", {
    openapi: "3.1.0",
    info: {
        version: "2.0.0",
        title: "api.wanderer.moe",
    },
})

app.get(
    "/docs",
    swaggerUI({
        url: "/openapi",
    })
)

app.use("*", prettyJSON())

export default app
