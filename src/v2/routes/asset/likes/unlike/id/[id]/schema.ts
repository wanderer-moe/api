import { z } from "@hono/zod-openapi"

export const unlikeAssetByIdSchema = z.object({
    id: z.string().openapi({
        param: {
            name: "id",
            in: "path",
            description: "The ID of the asset to unlike.",
            required: true,
        },
    }),
})

export const unlikeAssetByIdResponseSchema = z.object({
    success: z.literal(true),
})
