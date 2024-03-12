import { OpenAPIHono } from "@hono/zod-openapi"
import { deleteAssetByIdRoute } from "./openapi"
import { getConnection } from "@/v2/db/turso"
import { eq } from "drizzle-orm"
import { asset } from "@/v2/db/schema"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(deleteAssetByIdRoute, async (ctx) => {
    const assetId = ctx.req.valid("param").id

    const { drizzle } = await getConnection(ctx.env)

    const [existingAsset] = await drizzle
        .select({ id: asset.id })
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

    await drizzle.delete(asset).where(eq(asset.id, parseInt(assetId)))
    // await ctx.env.FILES_BUCKET.delete(asset.url)

    return ctx.json(
        {
            success: true,
        },
        200
    )
})

export default handler
