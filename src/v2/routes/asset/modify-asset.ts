import { getConnection } from "@/v2/db/turso"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"
import { asset, assetTag, assetTagAsset } from "@/v2/db/schema"
import { and, eq } from "drizzle-orm"
import { SplitQueryByCommas } from "@/v2/lib/helpers/split-query-by-commas"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "@hono/zod-openapi"
import { AppHandler } from "../handler"

const paramsSchema = z.object({
    id: z.string().openapi({
        param: {
            description: "The id of the asset to modify.",
            example: "asset_id",
            in: "path",
            required: true,
        },
    }),
})

const requestBodySchema = z.object({
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
    allowComments: z.string().min(0).max(1).optional().openapi({
        description: "If comments are allowed on the asset. 1 = Yes, 0 = No.",
        example: "1",
    }),
})

const modifyAssetResponseSchema = z.object({
    success: z.literal(true),
})

const openRoute = createRoute({
    path: "/{id}/modify",
    method: "patch",
    summary: "Modify an asset",
    description: "Modify an existing asset.",
    tags: ["Asset"],
    request: {
        params: paramsSchema,
        body: {
            content: {
                "application/json": {
                    schema: requestBodySchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Returns the asset's new attributes",
            content: {
                "application/json": {
                    schema: modifyAssetResponseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

export const ModifyAssetRoute = (handler: AppHandler) => {
    handler.openapi(openRoute, async (ctx) => {
        const { name, tags, assetCategoryId, gameId, allowComments } =
            ctx.req.valid("json")
        const assetId = ctx.req.valid("param").id

        const authSessionManager = new AuthSessionManager(ctx)

        const { user } = await authSessionManager.validateSession()

        if (!user) {
            return ctx.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                401
            )
        }

        const { drizzle } = getConnection(ctx.env)

        const [assetUser] = await drizzle
            .select({
                uploadedById: asset.uploadedById,
            })
            .from(asset)
            .where(eq(asset.id, assetId))

        if (assetUser.uploadedById !== user.id || user.role != "creator") {
            return ctx.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                401
            )
        }

        await drizzle
            .update(asset)
            .set({
                name,
                assetCategoryId,
                gameId,
                allowComments: Boolean(allowComments),
            })
            .where(eq(asset.id, assetId))
            .returning()

        const newTags = SplitQueryByCommas(tags) ?? []

        const oldTags = await drizzle
            .select({
                assetTagId: assetTag.id,
            })
            .from(assetTagAsset)
            .innerJoin(assetTag, eq(assetTag.id, assetTagAsset.assetTagId))
            .where(eq(assetTagAsset.assetId, assetId))

        const oldTagIds = oldTags.map((t) => t.assetTagId)
        const tagsToRemove = oldTagIds.filter((t) => !newTags.includes(t))
        const tagsToAdd = newTags.filter((t) => !oldTagIds.includes(t))

        const tagBatchQueries = [
            ...tagsToRemove.map((tagId) =>
                drizzle
                    .delete(assetTagAsset)
                    .where(
                        and(
                            eq(assetTagAsset.assetId, assetId),
                            eq(assetTagAsset.assetTagId, tagId)
                        )
                    )
            ),
            ...tagsToAdd.map((tag) =>
                drizzle.insert(assetTagAsset).values({
                    assetId: assetId,
                    assetTagId: tag,
                })
            ),
        ]

        // https://github.com/drizzle-team/drizzle-orm/issues/1301
        type TagBatchQuery = (typeof tagBatchQueries)[number]

        await drizzle.batch(
            tagBatchQueries as [TagBatchQuery, ...TagBatchQuery[]]
        )

        return ctx.json(
            {
                success: true,
            },
            200
        )
    })
}
