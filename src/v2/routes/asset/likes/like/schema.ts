import { z } from "@hono/zod-openapi"

export const likeAssetByIdSchema = z.object({
    id: z.string().openapi({
        description: "The id of the asset to like.",
        example: "1",
    }),
})

export const likeAssetByIdResponseSchema = z.object({
    success: z.literal(true),
})
