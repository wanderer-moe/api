import { OpenAPIHono } from "@hono/zod-openapi"
import UserGetRoute from "@/v2/routes/user/get/handler"
import UserSearchRoute from "@/v2/routes/user/search/handler"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.route("/get", UserGetRoute)
handler.route("/search", UserSearchRoute)

export default handler
