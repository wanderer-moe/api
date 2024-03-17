import { OpenAPIHono } from "@hono/zod-openapi"
import { game } from "@/v2/db/schema"
import { eq } from "drizzle-orm"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"
import { getConnection } from "@/v2/db/turso"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "@hono/zod-openapi"
import { selectGameSchema } from "@/v2/db/schema"

export const createGameSchema = z.object({
    name: z.string().min(3).max(32).openapi({
        description: "The name of the game.",
        example: "honkai-star-rail",
    }),
    formattedName: z.string().min(3).max(64).openapi({
        description: "The formatted name of the game.",
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

export const createGameResponse = z.object({
    success: z.literal(true),
    game: selectGameSchema,
})

const createGameRoute = createRoute({
    path: "/",
    method: "post",
    description: "Create a new game.",
    tags: ["Game"],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: createGameSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Returns the new game.",
            content: {
                "application/json": {
                    schema: createGameResponse,
                },
            },
        },
        ...GenericResponses,
    },
})

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
