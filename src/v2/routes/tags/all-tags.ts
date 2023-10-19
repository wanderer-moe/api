import { getConnection } from "@/v2/db/turso"

export async function listAllassetTag(c: APIContext): Promise<Response> {
    const cacheKey = new Request(c.req.url.toString(), c.req)
    const cache = caches.default
    let response = await cache.match(cacheKey)

    if (response) return response

    const { drizzle } = getConnection(c.env)

    const allassetTag = await drizzle.query.assetTag.findMany({
        orderBy: (assetTag) => assetTag.name,
    })

    response = c.json(
        {
            success: true,
            status: "ok",
            allassetTag,
        },
        200
    )

    response.headers.set("Cache-Control", "s-maxage=604800")
    await cache.put(cacheKey, response.clone())

    return response
}
