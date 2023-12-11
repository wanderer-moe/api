import { OpenAPIHono } from "@hono/zod-openapi"
import FilterAssetSearchAllRoute from "@/v2/routes/asset/search/all/route"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.route("/all", FilterAssetSearchAllRoute)

export default handler
