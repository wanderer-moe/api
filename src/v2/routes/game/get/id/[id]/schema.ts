import { z } from "@hono/zod-openapi"
import { selectGameSchema } from "@/v2/db/schema"

export const getGameByIdSchema = z.object({
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

export const getGameByIDResponse = z.object({
    success: z.literal(true),
    game: selectGameSchema,
})
