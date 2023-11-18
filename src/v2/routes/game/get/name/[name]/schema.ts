import { z } from "@hono/zod-openapi"

export const getGameByNameSchema = z.object({
    name: z.string().openapi({
        param: {
            name: "name",
            in: "path",
            required: true,
        },
        description: "The name of the game to retrieve.",
    }),
})
