import { OpenAPIHono } from "@hono/zod-openapi"
import AllContributorsRoute from "./all-contributors"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.route("/all", AllContributorsRoute)

export default handler
