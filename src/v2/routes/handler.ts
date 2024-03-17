import { OpenAPIHono } from "@hono/zod-openapi"
import UserRoute from "@/v2/routes/user/handler"
import GameRoute from "@/v2/routes/game/handler"
import AssetRoute from "@/v2/routes/asset/handler"
import ContributorRoute from "@/v2/routes/contributors/handler"
import AuthRoute from "@/v2/routes/auth/handler"
import RequestFormRoute from "@/v2/routes/requests/handler"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.route("/game", GameRoute)
handler.route("/asset", AssetRoute)
handler.route("/user", UserRoute)
handler.route("/contributors", ContributorRoute)
handler.route("/auth", AuthRoute)
handler.route("/request", RequestFormRoute)

export default handler
