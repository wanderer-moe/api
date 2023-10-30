import { getConnection } from "@/v2/db/turso"
import { assets } from "@/v2/db/schema"
import { desc } from "drizzle-orm"

export async function getAssetFromId(c: APIContext): Promise<Response> {
    const { id } = c.req.param()
    const cacheKey = new Request(c.req.url.toString(), c.req)
    const cache = caches.default
    let response = await cache.match(cacheKey)

    if (response) return response

    const { drizzle } = getConnection(c.env)

    const asset = await drizzle.query.assets.findFirst({
        where: (assets, { eq, and }) =>
            and(eq(assets.status, "approved"), eq(assets.id, parseInt(id))),
        with: {
            assetTagAsset: {
                with: {
                    assetTag: true,
                },
            },
            users: {
                columns: {
                    email: false,
                    emailVerified: false,
                },
            },
        },
    })

    if (!asset) {
        response = c.json(
            {
                success: false,
                status: "not found",
            },
            200
        )
        await cache.put(cacheKey, response.clone())
        return response
    }

    await drizzle.update(assets).set({ viewCount: asset.viewCount + 1 })

    const similarAssets = await drizzle.query.assets.findMany({
        where: (assets, { eq, and }) =>
            and(
                eq(assets.status, "approved"),
                eq(assets.assetCategory, asset.assetCategory)
            ),
        limit: 6,
        orderBy: desc(assets.id),
    })

    response = c.json(
        {
            success: true,
            status: "ok",
            asset,
            similarAssets,
        },
        200
    )

    response.headers.set("Cache-Control", "s-maxage=604800")
    await cache.put(cacheKey, response.clone())

    return response
}
