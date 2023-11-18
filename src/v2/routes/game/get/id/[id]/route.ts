import { OpenAPIHono } from "@hono/zod-openapi"
import { getGameByIdRoute } from "./openapi"
import { GameManager } from "@/v2/lib/managers/game/game-manager"
import { getConnection } from "@/v2/db/turso"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(getGameByIdRoute, async (ctx) => {
    const id = ctx.req.valid("param").id

    const { drizzle } = await getConnection(ctx.env)
    const gameManager = new GameManager(drizzle)
    const game = await gameManager.getGameById(id)

    return ctx.jsonT({
        game,
    })
})

export default handler
