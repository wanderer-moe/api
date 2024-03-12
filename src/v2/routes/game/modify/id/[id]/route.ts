import { OpenAPIHono } from "@hono/zod-openapi"
import { modifyGameRoute } from "./openapi"
import { eq } from "drizzle-orm"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"
import { getConnection } from "@/v2/db/turso"
import { game } from "@/v2/db/schema"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(modifyGameRoute, async (ctx) => {
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
    const { id } = ctx.req.valid("param")

    const { drizzle } = getConnection(ctx.env)

    const [existingGame] = await drizzle
        .select({ id: game.id })
        .from(game)
        .where(eq(game.id, id))

    if (!existingGame.id) {
        return ctx.json(
            {
                success: false,
                message: "Game with ID not found",
            },
            400
        )
    }

    const [updatedGame] = await drizzle
        .update(game)
        .set({
            name,
            formattedName,
            possibleSuggestiveContent: Boolean(possibleSuggestiveContent),
            lastUpdated: new Date().toISOString(),
        })
        .where(eq(game.id, id))
        .returning()

    return ctx.json(
        {
            success: true,
            game: updatedGame,
        },
        200
    )
})

export default handler
