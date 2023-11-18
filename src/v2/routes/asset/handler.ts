import { OpenAPIHono } from "@hono/zod-openapi"
import AssetGetRoute from "@/v2/routes/asset/get/handler"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.route("/get", AssetGetRoute)

export default handler
