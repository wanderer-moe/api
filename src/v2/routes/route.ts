import { OpenAPIHono } from "@hono/zod-openapi"
import UserRoute from "@/v2/routes/user/route"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.route("", UserRoute)

export default handler
