import { AppHandler } from "../handler"
import { eq } from "drizzle-orm"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"
import { getConnection } from "@/v2/db/turso"
import { game } from "@/v2/db/schema"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "@hono/zod-openapi"
import { selectGameSchema } from "@/v2/db/schema"

export const modifyGamePathSchema = z.object({
    id: z.string().openapi({
        param: {
            name: "id",
            description: "The id of the game to modify.",
            example: "honkai-star-rail",
            in: "path",
            required: true,
        },
    }),
})

const modifyGameSchema = z.object({
    name: z.string().min(3).max(32).openapi({
        description: "The new name of the game.",
        example: "honkai-star-rail",
    }),
    formattedName: z.string().min(3).max(64).openapi({
        description: "The new formatted name of the game.",
        example: "Honkai: Star Rail",
    }),
    possibleSuggestiveContent: z
        .string()
        .min(0)
        .max(1)
        .openapi({
            description:
                "If the game contains suggestive content. 1 = Yes, 0 = No.",
            example: "1",
        })
        .transform((value) => parseInt(value))
        .refine((value) => value === 1 || value === 0),
})

const modifyGameResponseSchema = z.object({
    success: z.literal(true),
    game: selectGameSchema,
})

export const modifyGameRoute = createRoute({
    path: "/{id}/modify",
    method: "patch",
    description: "Modify an existing game.",
    tags: ["Game"],
    request: {
        params: modifyGamePathSchema,
        body: {
            content: {
                "application/json": {
                    schema: modifyGameSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Returns the game's attributes",
            content: {
                "application/json": {
                    schema: modifyGameResponseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

export const ModifyGameRoute = (handler: AppHandler) => {
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
}
