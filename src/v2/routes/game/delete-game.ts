import { OpenAPIHono } from "@hono/zod-openapi"
import { getConnection } from "@/v2/db/turso"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"
import { game } from "@/v2/db/schema"
import { eq } from "drizzle-orm"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "@hono/zod-openapi"

export const deleteGameSchema = z.object({
    id: z.string().openapi({
        param: {
            name: "id",
            in: "path",
            description: "The ID of the game to delete.",
            example: "genshin-impact",
            required: true,
        },
    }),
})

export const deleteGameResponse = z.object({
    success: z.literal(true),
})

const deleteGameRoute = createRoute({
    path: "/{id}",
    method: "delete",
    description: "Delete a game & all its related assets.",
    tags: ["Game"],
    request: {
        params: deleteGameSchema,
    },
    responses: {
        200: {
            description: "Returns boolean indicating success.",
            content: {
                "application/json": {
                    schema: deleteGameResponse,
                },
            },
        },
        ...GenericResponses,
    },
})

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(deleteGameRoute, async (ctx) => {
    const id = ctx.req.valid("param").id

    const { drizzle } = await getConnection(ctx.env)

    const [foundGame] = await drizzle
        .select({ id: game.id })
        .from(game)
        .where(eq(game.id, id))

    if (!foundGame) {
        return ctx.json(
            {
                success: false,
                message: "Game not found",
            },
            400
        )
    }

    const authSessionManager = new AuthSessionManager(ctx)
    const { user } = await authSessionManager.validateSession()

    if (!user) {
        return ctx.json(
            {
                success: false,
                message: "Unauthorized",
            },
            401
        )
    }

    if (user.role != "creator") {
        return ctx.json(
            {
                success: false,
                message: "Unauthorized",
            },
            401
        )
    }

    await drizzle.delete(game).where(eq(game.id, id))
    // await ctx.env.FILES_BUCKET.delete("/assets/" + id)

    return ctx.json(
        {
            success: true,
        },
        200
    )
})

export default handler
