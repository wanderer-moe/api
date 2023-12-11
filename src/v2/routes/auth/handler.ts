import { OpenAPIHono } from "@hono/zod-openapi"
import SessionHandler from "@/v2/routes/auth/session/handler"
import LoginRoute from "@/v2/routes/auth/login/route"
import CreateAccountRoute from "@/v2/routes/auth/create/route"
import { cors } from "hono/cors"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.use(
    "*",
    cors({
        origin: "*",
        credentials: true,
    })
)

handler.route("/session", SessionHandler)
handler.route("/login", LoginRoute)
handler.route("/create", CreateAccountRoute)

export default handler
