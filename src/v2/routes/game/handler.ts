import { OpenAPIHono } from "@hono/zod-openapi"
import { AllGamesRoute } from "./all-games"
import { CreateGameRoute } from "./create-game"
import { DeleteGameRoute } from "./delete-game"
import { GetGameByIdRoute } from "./get-game"
import { ModifyGameRoute } from "./modify-game"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

AllGamesRoute(handler)
GetGameByIdRoute(handler)
ModifyGameRoute(handler)
DeleteGameRoute(handler)
CreateGameRoute(handler)

export default handler
