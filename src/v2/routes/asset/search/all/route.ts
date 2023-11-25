import { OpenAPIHono } from "@hono/zod-openapi"
import { assetSearchAllFilterRoute } from "./openapi"
import { getConnection } from "@/v2/db/turso"
import { AssetManager } from "@/v2/lib/managers/asset/asset-manager"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(assetSearchAllFilterRoute, async (ctx) => {
    const { drizzle } = await getConnection(ctx.env)
    const assetManager = new AssetManager(drizzle)
    const assets = await assetManager.searchAssets(ctx.req.valid("query"))

    return ctx.jsonT(
        {
            success: true,
            assets,
        },
        200
    )
})

export default handler
