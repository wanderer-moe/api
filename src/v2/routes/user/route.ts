import { OpenAPIHono } from "@hono/zod-openapi"
import UserGetRoute from "@/v2/routes/user/get/route"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.route("/get", UserGetRoute)

export default handler
