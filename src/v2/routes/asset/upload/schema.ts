import { z } from "@hono/zod-openapi"

const ACCEPTED_IMAGE_TYPES = ["image/png"]
const MAX_FILE_SIZE = 5 * 1024 * 1024

export const uploadAssetSchema = z.object({
    asset: z
        .any()
        .openapi({
            description: "The image of the asset to upload.",
            example: "asset",
        })
        .refine((files) => files?.length == 1, "Image is required.")
        .refine(
            (files) => files?.[0]?.size <= MAX_FILE_SIZE,
            `Max file size is 5MB.`
        )
        .refine(
            (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
            ".jpg, .jpeg, .png and .webp files are accepted."
        ),
    name: z.string().min(3).max(32).openapi({
        description: "The name of the asset.",
        example: "asset",
    }),
    tags: z
        .string()
        .openapi({
            description: "Comma seperated list of tags for the asset.",
            example: "tag1,tag2,tag3",
        })
        .optional(),
    assetCategoryId: z.string().openapi({
        description: "The asset category ID for the asset.",
        example: "assetCategoryId",
    }),
    gameId: z.string().openapi({
        description: "The game ID for the asset.",
        example: "gameId",
    }),
})
