import { OpenAPIHono } from "@hono/zod-openapi"
import { deleteGameRoute } from "./openapi"
import { GameManager } from "@/v2/lib/managers/game/game-manager"
import { getConnection } from "@/v2/db/turso"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(deleteGameRoute, async (ctx) => {
    const id = ctx.req.valid("param").id

    const { drizzle } = await getConnection(ctx.env)
    const gameManager = new GameManager(drizzle)
    const gameExists = await gameManager.doesGameExist(id)

    if (!gameExists) {
        return ctx.json(
            {
                success: false,
                message: "Game not found",
            },
            400
        )
    }

    await gameManager.deleteGame(id)
    await ctx.env.FILES_BUCKET.delete("/assets/" + id)

    return ctx.json(
        {
            success: true,
        },
        200
    )
})

export default handler
