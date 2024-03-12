import { OpenAPIHono } from "@hono/zod-openapi"
import { createGameRoute } from "./openapi"
import { game } from "@/v2/db/schema"
import { eq } from "drizzle-orm"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"
import { getConnection } from "@/v2/db/turso"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(createGameRoute, async (ctx) => {
    const authSessionManager = new AuthSessionManager(ctx)

    const { user } = await authSessionManager.validateSession()

    if (!user || user.role != "creator") {
        return ctx.json(
            {
                success: false,
                message: "Unauthorized",
            },
            401
        )
    }

    const { name, formattedName, possibleSuggestiveContent } =
        ctx.req.valid("json")

    const { drizzle } = getConnection(ctx.env)

    const [gameExists] = await drizzle
        .select({ name: game.name })
        .from(game)
        .where(eq(game.name, name))

    if (gameExists.name) {
        return ctx.json(
            {
                success: false,
                message: "Game already exists",
            },
            400
        )
    }

    const [newGame] = await drizzle
        .insert(game)
        .values({
            id: name,
            name,
            formattedName,
            possibleSuggestiveContent: Boolean(possibleSuggestiveContent),
            lastUpdated: new Date().toISOString(),
        })
        .returning()

    return ctx.json(
        {
            success: true,
            game: newGame,
        },
        200
    )
})

export default handler
