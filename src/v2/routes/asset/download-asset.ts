import { getConnection } from "@/v2/db/turso"
import { eq } from "drizzle-orm"
import { asset } from "@/v2/db/schema"

export async function downloadAsset(c: APIContext): Promise<Response> {
    const { assetId } = c.req.param()

    const { drizzle } = getConnection(c.env)

    const foundAsset = await drizzle.query.asset.findFirst({
        where: (asset, { eq }) => eq(asset.id, parseInt(assetId)),
    })

    if (!foundAsset) {
        return c.json({ success: false, state: "asset not found" }, 200)
    }

    try {
        await drizzle
            .update(asset)
            .set({ downloadCount: foundAsset.downloadCount + 1 })
            .where(eq(asset.id, parseInt(assetId)))
            .execute()
    } catch (e) {
        return c.json(
            { success: false, state: "failed to download asset" },
            500
        )
    }

    const response = await fetch(asset[0].url)

    const blob = await response.blob()

    const headers = new Headers()
    headers.set("Content-Disposition", `attachment; filename=${asset[0].name}`)

    return new Response(blob, {
        headers: headers,
    })
}
