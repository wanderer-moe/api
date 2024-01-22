import { z } from "@hono/zod-openapi"

export const likeAssetByIdSchema = z.object({
    id: z.string().openapi({
        param: {
            name: "id",
            in: "path",
            description: "The ID of the asset to like.",
            required: true,
        },
    }),
})

export const likeAssetByIdResponseSchema = z.object({
    success: z.literal(true),
})
