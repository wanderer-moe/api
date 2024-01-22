import { z } from "@hono/zod-openapi"
import {
    selectAssetSchema,
    selectAssetTagAssetSchema,
    selectAssetTagSchema,
    selectAssetLikesSchema,
} from "@/v2/db/schema"

export const allAssetLikesSchema = z.object({
    success: z.literal(true),
    likes: z.array(
        selectAssetLikesSchema.extend({
            asset: selectAssetSchema.extend({
                assetTagAsset: z.array(
                    selectAssetTagAssetSchema.extend({
                        assetTag: selectAssetTagSchema,
                    })
                ),
            }),
        })
    ),
})
