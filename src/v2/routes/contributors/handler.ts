import { OpenAPIHono } from "@hono/zod-openapi"
import AllContributorsRoute from "@/v2/routes/contributors/get/all/route"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.route("/get/list", AllContributorsRoute)

export default handler
