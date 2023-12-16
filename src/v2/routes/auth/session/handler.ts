import { OpenAPIHono } from "@hono/zod-openapi"
import GetAllSessionsRoute from "@/v2/routes/auth/session/all/route"
import ValidateSessionRoute from "@/v2/routes/auth/session/validate/route"
import LogoutCurrentSessionRoute from "@/v2/routes/auth/session/logout/route"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.route("/all", GetAllSessionsRoute)
handler.route("/validate", ValidateSessionRoute)
handler.route("/logout", LogoutCurrentSessionRoute)

export default handler
