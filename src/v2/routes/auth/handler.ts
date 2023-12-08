import { OpenAPIHono } from "@hono/zod-openapi"
import SessionHandler from "@/v2/routes/auth/session/handler"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.route("/session", SessionHandler)

export default handler
