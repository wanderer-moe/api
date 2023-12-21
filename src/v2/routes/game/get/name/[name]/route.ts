import { OpenAPIHono } from "@hono/zod-openapi"
import { getGameByNameRoute } from "./openapi"
import { GameManager } from "@/v2/lib/managers/game/game-manager"
import { getConnection } from "@/v2/db/turso"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(getGameByNameRoute, async (ctx) => {
    const name = ctx.req.valid("param").name

    const { drizzle } = await getConnection(ctx.env)
    const gameManager = new GameManager(drizzle)
    const game = await gameManager.getGameByName(name)

    if (!game) {
        return ctx.json(
            {
                success: true,
                message: "Game not found",
            },
            400
        )
    }

    return ctx.json(
        {
            success: true,
            game,
        },
        200
    )
})

export default handler
