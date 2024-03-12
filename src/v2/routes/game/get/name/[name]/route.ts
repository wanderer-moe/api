import { OpenAPIHono } from "@hono/zod-openapi"
import { getGameByNameRoute } from "./openapi"
import { game } from "@/v2/db/schema"
import { eq } from "drizzle-orm"
import { getConnection } from "@/v2/db/turso"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(getGameByNameRoute, async (ctx) => {
    const name = ctx.req.valid("param").name

    const { drizzle } = await getConnection(ctx.env)

    const [foundGame] = await drizzle
        .select()
        .from(game)
        .where(eq(game.name, name))

    if (!foundGame) {
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
            game: foundGame,
        },
        200
    )
})

export default handler
