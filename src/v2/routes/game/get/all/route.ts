import { OpenAPIHono } from "@hono/zod-openapi"
import { getAllGamesRoute } from "./openapi"
import { getConnection } from "@/v2/db/turso"
import { game } from "@/v2/db/schema"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(getAllGamesRoute, async (ctx) => {
    const { drizzle } = await getConnection(ctx.env)

    const games = (await drizzle.select().from(game)) ?? []

    return ctx.json(
        {
            success: true,
            games,
        },
        200
    )
})

export default handler
