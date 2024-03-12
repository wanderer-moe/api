import { OpenAPIHono } from "@hono/zod-openapi"
import { getConnection } from "@/v2/db/turso"
import { modifyAssetRoute } from "./openapi"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"
import { asset, assetTag, assetTagAsset } from "@/v2/db/schema"
import { and, eq } from "drizzle-orm"
import { SplitQueryByCommas } from "@/v2/lib/helpers/split-query-by-commas"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(modifyAssetRoute, async (ctx) => {
    const { name, tags, assetCategoryId, gameId } = ctx.req.valid("json")
    const { id } = ctx.req.valid("param")

    if (isNaN(parseInt(id))) {
        return ctx.json(
            {
                success: false,
                message: "Invalid asset ID",
            },
            400
        )
    }

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
        .where(eq(asset.id, parseInt(id)))

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
        })
        .where(eq(asset.id, parseInt(id)))
        .returning()

    const newTags = SplitQueryByCommas(tags) ?? []

    const oldTags = await drizzle
        .select({
            assetTagId: assetTag.id,
        })
        .from(assetTagAsset)
        .innerJoin(assetTag, eq(assetTag.id, assetTagAsset.assetTagId))
        .where(eq(assetTagAsset.assetId, parseInt(id)))

    const oldTagIds = oldTags.map((t) => t.assetTagId)
    const tagsToRemove = oldTagIds.filter((t) => !newTags.includes(t))
    const tagsToAdd = newTags.filter((t) => !oldTagIds.includes(t))

    const tagBatchQueries = [
        ...tagsToRemove.map((tagId) =>
            drizzle
                .delete(assetTagAsset)
                .where(
                    and(
                        eq(assetTagAsset.assetId, parseInt(id)),
                        eq(assetTagAsset.assetTagId, tagId)
                    )
                )
        ),
        ...tagsToAdd.map((tag) =>
            drizzle.insert(assetTagAsset).values({
                assetId: parseInt(id),
                assetTagId: tag,
            })
        ),
    ]

    // https://github.com/drizzle-team/drizzle-orm/issues/1301
    type TagBatchQuery = (typeof tagBatchQueries)[number]

    await drizzle.batch(tagBatchQueries as [TagBatchQuery, ...TagBatchQuery[]])

    return ctx.json(
        {
            success: true,
        },
        200
    )
})

export default handler
