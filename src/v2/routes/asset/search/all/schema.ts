import { z } from "@hono/zod-openapi"
import {
    selectAssetSchema,
    selectAssetTagAssetSchema,
    selectAssetTagSchema,
} from "@/v2/db/schema"

export const assetSearchAllFilterResponseSchema = z.object({
    success: z.literal(true),
    // mmm nested schemas
    assets: z.array(
        selectAssetSchema.extend({
            assetTagAsset: z.array(
                selectAssetTagAssetSchema.extend({
                    assetTag: selectAssetTagSchema,
                })
            ),
        })
    ),
})

export const assetSearchAllFilterSchema = z
    .object({
        name: z.string().openapi({
            param: {
                description:
                    "The name of the asset(s) to retrieve. Doesn't have to be exact, uses 'like' operator to search.",
                name: "name",
                in: "query",
                example: "keqing",
                required: false,
            },
        }),
        game: z.string().openapi({
            param: {
                description:
                    "The game id(s) of the asset(s) to retrieve. Comma seperated.",
                name: "game",
                in: "query",
                example: "genshin-impact,honkai-impact-3rd",
                required: false,
            },
        }),
        category: z.string().openapi({
            param: {
                description:
                    "The category id(s) of the asset(s) to retrieve. Comma seperated.",
                name: "category",
                in: "query",
                example: "character-sheets,splash-art",
                required: false,
            },
        }),
        tags: z.string().openapi({
            param: {
                description: "The tag id(s) of the asset(s) to retrieve.",
                name: "tags",
                in: "query",
                example: "official,fanmade",
                required: false,
            },
        }),
        offset: z.string().openapi({
            param: {
                description:
                    "The offset of the asset(s) to retrieve. For pagination / infinite scrolling.",
                name: "offset",
                example: "0",
                in: "query",
                required: false,
            },
        }),
    })
    .partial()

export type assetSearchAllFilter = z.infer<typeof assetSearchAllFilterSchema>
