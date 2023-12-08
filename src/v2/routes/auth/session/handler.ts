import { OpenAPIHono } from "@hono/zod-openapi"
import GetAllSessionsRoute from "@/v2/routes/auth/session/all/route"
import ValidateSessionRoute from "@/v2/routes/auth/session/validate/route"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.route("/all", GetAllSessionsRoute)
handler.route("/validate", ValidateSessionRoute)

export default handler
