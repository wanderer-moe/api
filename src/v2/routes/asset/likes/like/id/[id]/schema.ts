import { z } from "@hono/zod-openapi"

export const likeAssetByIdSchema = z.object({
    id: z.string().openapi({
        param: {
            description: "The id of the asset to like.",
            example: "1",
            in: "path",
            name: "id",
            required: true,
        },
    }),
})

export const likeAssetByIdResponseSchema = z.object({
    success: z.literal(true),
})
