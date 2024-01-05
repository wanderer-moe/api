import { OpenAPIHono } from "@hono/zod-openapi"
import GameGetRoute from "./get/handler"
import GameCreateRoute from "./create/route"
import DeleteGameRoute from "./delete/id/[id]/route"
import ModifyGameRoute from "./modify/id/[id]/route"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.route("/get", GameGetRoute)
handler.route("/create", GameCreateRoute)
handler.route("/modify", ModifyGameRoute)
handler.route("/delete", DeleteGameRoute)

export default handler
