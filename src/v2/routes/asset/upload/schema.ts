import { z } from "@hono/zod-openapi"

const AcceptedImageType = "image/png"
const MaxFileSize = 5 * 1024 * 1024

export const uploadAssetSchema = z.object({
    asset: z
        .any()
        .openapi({
            description: "The image of the asset to upload.",
            example: "asset",
        })
        .refine((files) => files?.length == 1, "An image is required.")
        .refine(
            (files) => files?.[0]?.size <= MaxFileSize,
            `Max file size is 5MB)`
        )
        .refine(
            (files) => files?.[0]?.type === AcceptedImageType,
            `Only ${AcceptedImageType} is accepted.`
        ),
    name: z.string().min(3).max(32).openapi({
        description: "The name of the asset.",
        example: "keqing-nobg.png",
    }),
    tags: z
        .string()
        .openapi({
            description: "Comma seperated list of tags for the asset.",
            example: "official,1.0",
        })
        .optional(),
    assetCategoryId: z.string().openapi({
        description: "The asset category ID for the asset.",
        example: "splash-art",
    }),
    gameId: z.string().openapi({
        description: "The game ID for the asset.",
        example: "genshin-impact",
    }),
    assetIsSuggestive: z
        .string()
        .min(1)
        .max(1)
        .openapi({
            description: "If the asset contains suggestive content 0 or 1.",
            example: "1",
        })
        .transform((value) => parseInt(value))
        .refine((value) => value === 1 || value === 0),
})
