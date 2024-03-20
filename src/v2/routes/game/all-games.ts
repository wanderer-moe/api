import { AppHandler } from "../handler"
import { getConnection } from "@/v2/db/turso"
import { game } from "@/v2/db/schema"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { createRoute } from "@hono/zod-openapi"
import { z } from "@hono/zod-openapi"
import { selectGameSchema } from "@/v2/db/schema"

const responseSchema = z.object({
    success: z.literal(true),
    games: selectGameSchema.array(),
})

const openRoute = createRoute({
    path: "/all",
    method: "get",
    summary: "Get all games",
    description: "Get all games.",
    tags: ["Game"],
    responses: {
        200: {
            description: "All games.",
            content: {
                "application/json": {
                    schema: responseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

export const AllGamesRoute = (handler: AppHandler) => {
    handler.openapi(openRoute, async (ctx) => {
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
}
