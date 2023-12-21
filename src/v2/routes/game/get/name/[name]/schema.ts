import { z } from "@hono/zod-openapi"
import { selectGameSchema } from "@/v2/db/schema"

export const getGameByNameSchema = z.object({
    name: z.string().openapi({
        param: {
            name: "name",
            in: "path",
            required: true,
            description: "The name of the game to retrieve.",
            example: "genshin-impact",
        },
    }),
})

export const getGameByNameResponse = z.object({
    success: z.literal(true),
    game: selectGameSchema,
})
