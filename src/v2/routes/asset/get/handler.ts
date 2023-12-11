import { OpenAPIHono } from "@hono/zod-openapi"
import GetAssetByIDRoute from "@/v2/routes/asset/get/id/[id]/route"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.route("/id", GetAssetByIDRoute)

export default handler
