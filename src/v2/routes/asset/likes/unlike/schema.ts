import { z } from "@hono/zod-openapi"

export const unlikeAssetByIdSchema = z.object({
    id: z.string().openapi({
        description: "The id of the asset to unlike.",
        example: "1",
    }),
})

export const unlikeAssetByIdResponseSchema = z.object({
    success: z.literal(true),
})
