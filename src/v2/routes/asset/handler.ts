import { OpenAPIHono } from "@hono/zod-openapi"
import AssetGetRoute from "@/v2/routes/asset/get/handler"
import AssetSearchRoute from "@/v2/routes/asset/search/handler"
import AssetModifyRoute from "@/v2/routes/asset/modify/id/[id]/route"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.route("/get", AssetGetRoute)
handler.route("/search", AssetSearchRoute)
handler.route("/modify/id/{id}", AssetModifyRoute)

export default handler
