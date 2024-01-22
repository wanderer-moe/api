import { OpenAPIHono } from "@hono/zod-openapi"
import UnlikeAssetByIdRoute from "@/v2/routes/asset/likes/unlike/route"
import LikeAssetByIdRoute from "@/v2/routes/asset/likes/like/route"
import AllAssetLikesRoute from "@/v2/routes/asset/likes/all/route"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.route("/unlike", UnlikeAssetByIdRoute)
handler.route("/like", LikeAssetByIdRoute)
handler.route("/all", AllAssetLikesRoute)

export default handler
