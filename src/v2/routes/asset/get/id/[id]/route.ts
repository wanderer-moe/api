import { OpenAPIHono } from "@hono/zod-openapi"
import { getAssetByIdRoute } from "./openapi"
import { getConnection } from "@/v2/db/turso"
import { AssetManager } from "@/v2/lib/managers/asset/asset-manager"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(getAssetByIdRoute, async (ctx) => {
    const assetId = ctx.req.valid("param").id

    if (isNaN(parseInt(assetId))) {
        return ctx.jsonT(
            {
                success: false,
                error: "Invalid asset ID",
            },
            400
        )
    }

    const { drizzle } = await getConnection(ctx.env)
    const assetManager = new AssetManager(drizzle)
    const asset = await assetManager.getAssetById(parseInt(assetId))

    if (!asset) {
        return ctx.jsonT(
            {
                success: true,
                error: "Asset not found",
            },
            200
        )
    }

    const similarAssets = await assetManager.getSimilarAssets(asset.id)

    return ctx.jsonT(
        {
            success: true,
            asset,
            similarAssets,
        },
        200
    )
})

export default handler
