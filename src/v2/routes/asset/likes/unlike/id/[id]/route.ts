import { OpenAPIHono } from "@hono/zod-openapi"
import { unlikeAssetByIdRoute } from "./openapi"
import { getConnection } from "@/v2/db/turso"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"
import { asset, assetLikes } from "@/v2/db/schema"
import { and, eq } from "drizzle-orm"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(unlikeAssetByIdRoute, async (ctx) => {
    const assetId = ctx.req.valid("param").id

    if (isNaN(parseInt(assetId))) {
        return ctx.json(
            {
                success: false,
                message: "Invalid asset ID",
            },
            400
        )
    }

    const { drizzle } = await getConnection(ctx.env)

    const [existingAsset] = await drizzle
        .select()
        .from(asset)
        .where(eq(asset.id, parseInt(assetId)))
        .limit(1)

    if (!existingAsset) {
        return ctx.json(
            {
                success: true,
                message: "Asset not found",
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

    const [assetLikeStatus] = await drizzle
        .select({ assetId: assetLikes.assetId })
        .from(assetLikes)
        .where(
            and(
                eq(assetLikes.assetId, parseInt(assetId)),
                eq(assetLikes.likedById, user.id)
            )
        )
        .limit(1)

    if (!assetLikeStatus) {
        return ctx.json(
            {
                success: false,
                message: "You have not liked this asset",
            },
            400
        )
    }

    await drizzle
        .delete(assetLikes)
        .where(
            and(
                eq(assetLikes.assetId, parseInt(assetId)),
                eq(assetLikes.likedById, user.id)
            )
        )

    return ctx.json(
        {
            success: true,
        },
        200
    )
})

export default handler
