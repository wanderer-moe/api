import { responseHeaders } from "@/lib/responseHeaders"
import { getConnection } from "@/db/turso"
import { assets } from "@/db/schema"
import { createNotFoundResponse } from "@/lib/helpers/responses/notFoundResponse"
import { eq, desc } from "drizzle-orm"
import type { APIContext as Context } from "@/worker-configuration"

export async function getAssetFromId(c: Context): Promise<Response> {
    const { id } = c.req.param()
    const cacheKey = new Request(c.req.url.toString(), c.req)
    const cache = caches.default
    let response = await cache.match(cacheKey)

    if (response) return response

    const drizzle = await getConnection(c.env).drizzle

    const asset = await drizzle
        .select()
        .from(assets)
        .where(eq(assets.id, parseInt(id)))
        .execute()

    if (!asset) {
        response = createNotFoundResponse(c, "Asset not found", responseHeaders)
        await cache.put(cacheKey, response.clone())
        return response
    }

    const similarAssets = await drizzle
        .select()
        .from(assets)
        .where(eq(assets.assetCategory, asset[0].assetCategory))
        .limit(6)
        .orderBy(desc(assets.id))
        .execute()

    response = c.json(
        {
            success: true,
            status: "ok",
            asset,
            similarAssets,
        },
        200,
        responseHeaders
    )

    response.headers.set("Cache-Control", "s-maxage=604800")
    await cache.put(cacheKey, response.clone())

    return response
}
