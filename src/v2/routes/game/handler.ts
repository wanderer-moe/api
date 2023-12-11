import { OpenAPIHono } from "@hono/zod-openapi"
import GameGetRoute from "./get/handler"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.route("/get", GameGetRoute)

export default handler
