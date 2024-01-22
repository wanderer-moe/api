import { OpenAPIHono } from "@hono/zod-openapi"
import { likeAssetByIdRoute } from "./openapi"
import { getConnection } from "@/v2/db/turso"
import { AssetManager } from "@/v2/lib/managers/asset/asset-manager"
import { AssetLikesManager } from "@/v2/lib/managers/asset/asset-likes"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(likeAssetByIdRoute, async (ctx) => {
    const assetId = ctx.req.valid("json").id

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
    const assetManager = new AssetManager(drizzle)
    const asset = await assetManager.getBarebonesAssetById(parseInt(assetId))

    if (!asset) {
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

    const assetLikeManager = new AssetLikesManager(drizzle)

    const likeStatus = await assetLikeManager.checkAssetLikeStatus(
        parseInt(assetId),
        user.id
    )

    if (likeStatus) {
        return ctx.json(
            {
                success: false,
                message: "Asset is already liked",
            },
            400
        )
    }

    await assetLikeManager.likeAsset(parseInt(assetId), user.id)

    return ctx.json(
        {
            success: true,
        },
        200
    )
})

export default handler
