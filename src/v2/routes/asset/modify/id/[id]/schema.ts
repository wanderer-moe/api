import { z } from "zod"

export const modifyAssetPathSchema = z.object({
    id: z.string().openapi({
        param: {
            description: "The id of the asset to modify.",
            example: "1",
            in: "path",
            required: true,
        },
    }),
})

export const modifyAssetSchema = z.object({
    name: z
        .string()
        .min(3)
        .max(32)
        .openapi({
            description: "The name of the asset.",
            example: "keqing-nobg.png",
        })
        .optional(),
    tags: z
        .string()
        .openapi({
            description: "Comma seperated list of tags for the asset.",
            example: "official,1.0",
        })
        .optional(),
    assetCategoryId: z
        .string()
        .openapi({
            description: "The asset category ID for the asset.",
            example: "splash-art",
        })
        .optional(),
    gameId: z
        .string()
        .openapi({
            description: "The game ID for the asset.",
            example: "genshin-impact",
        })
        .optional(),
})

export const modifyAssetResponseSchema = z.object({
    success: z.literal(true),
})
