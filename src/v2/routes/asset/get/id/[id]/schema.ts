import { z } from "@hono/zod-openapi"
import {
    selectAssetCategorySchema,
    selectGameSchema,
    selectAssetSchema,
    selectAssetTagAssetSchema,
    selectAssetTagSchema,
    selectUserSchema,
} from "@/v2/db/schema"

export const getAssetByIdSchema = z.object({
    id: z.string().openapi({
        param: {
            name: "id",
            in: "path",
            description: "The ID of the asset to retrieve.",
            required: true,
        },
    }),
})

export const getAssetByIdResponseSchema = z.object({
    success: z.literal(true),
    // mmm nested schemas
    asset: selectAssetSchema.extend({
        assetTagAsset: z.array(
            selectAssetTagAssetSchema.extend({
                assetTag: selectAssetTagSchema,
            })
        ),
    }),
    authUser: selectUserSchema.pick({
        id: true,
        avatarUrl: true,
        displayName: true,
        username: true,
        usernameColour: true,
        pronouns: true,
        verified: true,
        bio: true,
        dateJoined: true,
        isSupporter: true,
        roleFlags: true,
    }),
    game: selectGameSchema,
    assetCategory: selectAssetCategorySchema,
    // similarAssets: selectAssetSchema.array(),
})
