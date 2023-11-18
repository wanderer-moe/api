import { OpenAPIHono } from "@hono/zod-openapi"
import GetGameByNameRoute from "./name/[name]/route"
import GetGameByIdRoute from "./id/[id]/route"
import GetAllGamesRoute from "./all/route"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.route("/name", GetGameByNameRoute)
handler.route("/id", GetGameByIdRoute)
handler.route("/list", GetAllGamesRoute)

export default handler
