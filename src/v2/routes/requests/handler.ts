import { OpenAPIHono } from "@hono/zod-openapi"
import RequestFormCreateRoute from "@/v2/routes/requests/form/create/route"
import RequestFormDeleteRoute from "@/v2/routes/requests/form/delete/[id]/route"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.route("/create/form", RequestFormCreateRoute)
handler.route("/delete/form", RequestFormDeleteRoute)

export default handler
