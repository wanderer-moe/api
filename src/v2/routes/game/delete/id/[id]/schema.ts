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
