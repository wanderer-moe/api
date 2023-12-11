import { OpenAPIHono } from "@hono/zod-openapi"
import SearchUsersByUsernameRoute from "./username/[username]/route"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.route("/username", SearchUsersByUsernameRoute)

export default handler
