import { responseHeaders } from "@/v2/lib/response-headers"
import { getConnection } from "@/v2/db/turso"
import { desc } from "drizzle-orm"

import { assets } from "@/v2/db/schema"

// get 100 most recent assets, sorted by asset.uploadedDate
export async function recentAssets(c: APIContext): Promise<Response> {
    const cacheKey = new Request(c.req.url.toString(), c.req)
    const cache = caches.default
    let response = await cache.match(cacheKey)

    if (response) return response

    const { drizzle } = getConnection(c.env)

    const assetResponse = await drizzle.query.assets.findMany({
        orderBy: desc(assets.uploadedDate),
        limit: 100,
        where: (assets, { eq }) => eq(assets.status, "approved"),
    })

    response = c.json(
        {
            success: true,
            status: "ok",
            results: assetResponse,
        },
        200,
        responseHeaders
    )

    response.headers.set("Cache-Control", "s-maxage=60")
    await cache.put(cacheKey, response.clone())
    return response
}
