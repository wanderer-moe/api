import { OpenAPIHono } from "@hono/zod-openapi"
import AssetGetRoute from "@/v2/routes/asset/get/handler"
import AssetSearchRoute from "@/v2/routes/asset/search/handler"
import AssetModifyRoute from "@/v2/routes/asset/modify/id/[id]/route"
import AssetUploadRoute from "@/v2/routes/asset/upload/route"
import AssetDeleteRoute from "@/v2/routes/asset/delete/id/[id]/route"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.route("/get", AssetGetRoute)
handler.route("/search", AssetSearchRoute)
handler.route("/modify/id/{id}", AssetModifyRoute)
handler.route("/upload", AssetUploadRoute)
handler.route("/delete/id/{id}", AssetDeleteRoute)

export default handler
