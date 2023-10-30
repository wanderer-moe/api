import { getConnection } from "@/v2/db/turso"
import { asset } from "@/v2/db/schema"
import { desc } from "drizzle-orm"

export async function getAssetFromId(c: APIContext): Promise<Response> {
    const { id } = c.req.param()
    const cacheKey = new Request(c.req.url.toString(), c.req)
    const cache = caches.default
    let response = await cache.match(cacheKey)

    if (response) return response

    const { drizzle } = getConnection(c.env)

    const foundAsset = await drizzle.query.asset.findFirst({
        where: (asset, { eq, and }) =>
            and(eq(asset.status, "approved"), eq(asset.id, parseInt(id))),
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

    if (!foundAsset) {
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

    await drizzle.update(asset).set({ viewCount: foundAsset.viewCount + 1 })

    const similarAssets = await drizzle.query.asset.findMany({
        where: (asset, { eq, and }) =>
            and(
                eq(asset.status, "approved"),
                eq(asset.assetCategory, foundAsset.assetCategory)
            ),
        limit: 6,
        orderBy: desc(asset.id),
    })

    response = c.json(
        {
            success: true,
            status: "ok",
            asset: foundAsset,
            similarAssets: similarAssets ?? [],
        },
        200
    )

    response.headers.set("Cache-Control", "s-maxage=604800")
    await cache.put(cacheKey, response.clone())

    return response
}
