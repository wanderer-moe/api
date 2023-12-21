import { z } from "@hono/zod-openapi"
import { selectGameSchema } from "@/v2/db/schema"

export const getAllGamesResponse = z.object({
    success: z.literal(true),
    games: selectGameSchema.array(),
})
