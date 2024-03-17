import { OpenAPIHono } from "@hono/zod-openapi"
import GameCreateRoute from "./create-game"
import DeleteGameRoute from "./delete-game"
import ModifyGameRoute from "./modify-game"
import GameGetRoute from "./get-game"
import AllGamesRoute from "./all-games"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.route("/get", GameGetRoute)
handler.route("/modify", ModifyGameRoute)
handler.route("/delete", DeleteGameRoute)

handler.route("/create", GameCreateRoute)

handler.route("/list", AllGamesRoute)

export default handler
