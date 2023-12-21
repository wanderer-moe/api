import { createRoute } from "@hono/zod-openapi"
import { getAssetByIdSchema } from "./schema"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "zod"
import {
    selectAssetCategorySchema,
    selectGameSchema,
    selectAssetSchema,
    selectAssetTagAssetSchema,
    selectAssetTagSchema,
    selectUserSchema,
} from "@/v2/db/schema"

const getAssetByIdResponseSchema = z.object({
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
    similarAssets: selectAssetSchema.array(),
})

export const getAssetByIdRoute = createRoute({
    path: "/{id}",
    method: "get",
    description: "Get an asset by their ID.",
    tags: ["Asset"],
    request: {
        params: getAssetByIdSchema,
    },
    responses: {
        200: {
            description: "The found asset & similar assets are returned.",
            content: {
                "application/json": {
                    schema: getAssetByIdResponseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})
