import { OpenAPIHono } from "@hono/zod-openapi"
import { getGameByIdRoute } from "./openapi"
import { game } from "@/v2/db/schema"
import { getConnection } from "@/v2/db/turso"
import { eq } from "drizzle-orm"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(getGameByIdRoute, async (ctx) => {
    const id = ctx.req.valid("param").id

    const { drizzle } = await getConnection(ctx.env)

    const [foundGame] = await drizzle.select().from(game).where(eq(game.id, id))

    if (!foundGame) {
        return ctx.json(
            {
                success: false,
                message: "Game not found",
            },
            400
        )
    }

    return ctx.json(
        {
            success: true,
            game: foundGame,
        },
        200
    )
})

export default handler
