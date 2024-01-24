import { OpenAPIHono } from "@hono/zod-openapi"
import UserGetRoute from "@/v2/routes/user/get/handler"
import UserSearchRoute from "@/v2/routes/user/search/handler"
import UserFollowRoute from "@/v2/routes/user/follows/handler"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.route("/get", UserGetRoute)
handler.route("/search", UserSearchRoute)
handler.route("/follows", UserFollowRoute)

export default handler
