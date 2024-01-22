import { OpenAPIHono } from "@hono/zod-openapi"
import { getAssetByIdRoute } from "./openapi"
import { getConnection } from "@/v2/db/turso"
import { AssetManager } from "@/v2/lib/managers/asset/asset-manager"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(getAssetByIdRoute, async (ctx) => {
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
    const assetManager = new AssetManager(drizzle)
    const asset = await assetManager.getAssetById(parseInt(assetId))

    if (!asset) {
        return ctx.json(
            {
                success: true,
                message: "Asset not found",
            },
            400
        )
    }

    return ctx.json(
        {
            success: true,
            asset,
        },
        200
    )
})

export default handler
