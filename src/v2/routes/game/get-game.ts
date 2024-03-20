import { AppHandler } from "../handler"
import { createRoute } from "@hono/zod-openapi"
import { game } from "@/v2/db/schema"
import { getConnection } from "@/v2/db/turso"
import { eq } from "drizzle-orm"
import { z } from "@hono/zod-openapi"
import { selectGameSchema } from "@/v2/db/schema"
import { GenericResponses } from "@/v2/lib/response-schemas"

const paramsSchema = z.object({
    id: z.string().openapi({
        param: {
            name: "id",
            in: "path",
            description: "The ID of the game to retrieve.",
            example: "genshin-impact",
            required: true,
        },
    }),
})

const responseSchema = z.object({
    success: z.literal(true),
    game: selectGameSchema,
})

const openRoute = createRoute({
    path: "/{id}",
    method: "get",
    summary: "Get a game",
    description: "Get a game by their ID.",
    tags: ["Game"],
    request: {
        params: paramsSchema,
    },
    responses: {
        200: {
            description: "Game was found.",
            content: {
                "application/json": {
                    schema: responseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

export const GetGameByIdRoute = (handler: AppHandler) => {
    handler.openapi(openRoute, async (ctx) => {
        const id = ctx.req.valid("param").id

        const { drizzle } = await getConnection(ctx.env)

        const [foundGame] = await drizzle
            .select()
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

        return ctx.json(
            {
                success: true,
                game: foundGame,
            },
            200
        )
    })
}
