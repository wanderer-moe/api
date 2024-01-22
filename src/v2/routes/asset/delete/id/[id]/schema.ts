import { z } from "@hono/zod-openapi"

export const deleteAssetByIdSchema = z.object({
    id: z.string().openapi({
        param: {
            name: "id",
            in: "path",
            description: "The ID of the asset to delete.",
            example: "1",
            required: true,
        },
    }),
})

export const deleteAssetByIdResponseSchema = z.object({
    success: z.literal(true),
})
