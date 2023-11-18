import { OpenAPIHono } from "@hono/zod-openapi"
import SearchUserByIdRoute from "@/v2/routes/user/get/id/[id]/route"
import SearchUserByNameRoute from "@/v2/routes/user/get/username/[username]/route"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.route("/id", SearchUserByIdRoute)
handler.route("/username", SearchUserByNameRoute)

export default handler
