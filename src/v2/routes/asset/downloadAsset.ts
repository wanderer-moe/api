import { getConnection } from "@/v2/db/turso"
import { eq } from "drizzle-orm"
import { assets } from "@/v2/db/schema"

export async function downloadAsset(c: APIContext): Promise<Response> {
    const { assetId } = c.req.param()

    const drizzle = getConnection(c.env).drizzle

    const asset = await drizzle.query.assets.findFirst({
        where: (assets, { eq }) => eq(assets.id, parseInt(assetId)),
    })

    if (!asset) {
        c.status(200)
        return c.json({ success: false, state: "asset not found" })
    }

    try {
        await drizzle
            .update(assets)
            .set({ downloadCount: asset.downloadCount + 1 })
            .where(eq(assets.id, parseInt(assetId)))
            .execute()
    } catch (e) {
        console.error(e)
        c.status(500)
        return c.json({ success: false, state: "failed to download asset" })
    }

    const response = await fetch(asset[0].url)

    const blob = await response.blob()

    const headers = new Headers()
    headers.set("Content-Disposition", `attachment; filename=${asset[0].name}`)

    return new Response(blob, {
        headers: headers,
    })
}
