import { z } from "@hono/zod-openapi"

export const unlikeAssetByIdSchema = z.object({
    id: z.string().openapi({
        param: {
            description: "The id of the asset to unlike.",
            example: "1",
            in: "path",
            name: "id",
            required: true,
        },
    }),
})

export const unlikeAssetByIdResponseSchema = z.object({
    success: z.literal(true),
})
