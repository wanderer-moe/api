import { OpenAPIHono } from "@hono/zod-openapi"
import ViewAllRequestsRoute from "./all-requests"
import CreateRequestRoute from "./create-request"
import DeleteRequestRoute from "./delete-request"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.route("/view/all", ViewAllRequestsRoute)
handler.route("/create", CreateRequestRoute)
handler.route("/delete", DeleteRequestRoute)

export default handler
