import { z } from "@hono/zod-openapi"

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
