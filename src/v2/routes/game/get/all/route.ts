import { OpenAPIHono } from "@hono/zod-openapi"
import { getAllGamesRoute } from "./openapi"
import { GameManager } from "@/v2/lib/managers/game/game-manager"
import { getConnection } from "@/v2/db/turso"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(getAllGamesRoute, async (ctx) => {
    const { drizzle } = await getConnection(ctx.env)
    const gameManager = new GameManager(drizzle)
    const allGames = await gameManager.listGames()

    return ctx.json(
        {
            success: true,
            games: allGames,
        },
        200
    )
})

export default handler
