import { OpenAPIHono } from "@hono/zod-openapi"
import UserSearchRoute from "@/v2/routes/user/search/route"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.route("/search", UserSearchRoute)

export default handler
