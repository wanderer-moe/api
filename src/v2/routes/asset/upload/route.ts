import { OpenAPIHono } from "@hono/zod-openapi"
import { uploadAssetRoute } from "./openapi"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"
import { getConnection } from "@/v2/db/turso"
import { SplitQueryByCommas } from "@/v2/lib/helpers/split-query-by-commas"
import { assetTagAsset } from "@/v2/db/schema"
const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(uploadAssetRoute, async (ctx) => {
    const { asset, name, tags, assetCategoryId, gameId, assetIsSuggestive } =
        ctx.req.valid("form")

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

    if (
        user.role != "creator" &&
        user.role != "contributor" &&
        user.role != "staff"
    ) {
        return ctx.json(
            {
                success: false,
                message: "Unauthorized",
            },
            401
        )
    }

    const { drizzle } = getConnection(ctx.env)

    const { key } = await ctx.env.FILES_BUCKET.put(
        `/assets/${gameId}/${assetCategoryId}/${name}.png`,
        asset
    )

    const createdAsset = await drizzle
        .insert(asset)
        .values({
            name: name,
            extension: "png",
            gameId: gameId,
            assetCategoryId: assetCategoryId,
            url: key,
            uploadedByName: user.username,
            uploadedById: user.id,
            status: "pending",
            fileSize: 0,
            width: 0,
            height: 0,
            assetIsSuggestive: Boolean(assetIsSuggestive),
        })
        .returning()

    const tagsSplit = SplitQueryByCommas(tags) ?? []

    if (tagsSplit.length > 0) {
        const tagBatchQueries = tagsSplit.map((tag) =>
            drizzle.insert(assetTagAsset).values({
                assetId: createdAsset[0].id,
                assetTagId: tag,
            })
        )

        type TagBatchQuery = (typeof tagBatchQueries)[number]
        await drizzle.batch(
            tagBatchQueries as [TagBatchQuery, ...TagBatchQuery[]]
        )
    }

    return ctx.json(
        {
            success: true,
            asset: createdAsset[0],
        },
        200
    )
})

export default handler
