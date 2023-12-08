import { OpenAPIHono } from "@hono/zod-openapi"
import { swaggerUI } from "@hono/swagger-ui"
import { prettyJSON } from "hono/pretty-json"
import BaseRoutes from "@/v2/routes/handler"
import { OpenAPIConfig } from "./openapi/config"

import { csrfValidation } from "./v2/middleware/csrf"

const app = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

app.route("/v2", BaseRoutes)

app.get(
    "/docs",
    swaggerUI({
        url: "/openapi",
    })
)

app.use("*", csrfValidation)

app.use("*", prettyJSON())

app.doc("/openapi", OpenAPIConfig)

export default app
