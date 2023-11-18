import { OpenAPIHono } from "@hono/zod-openapi"
import UserRoute from "@/v2/routes/user/handler"
import GameRoute from "@/v2/routes/game/handler"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.route("/user", UserRoute)
handler.route("/game", GameRoute)

export default handler
