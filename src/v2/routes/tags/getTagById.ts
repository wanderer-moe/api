import { getConnection } from "@/v2/db/turso"

export async function getTagById(c: APIContext): Promise<Response> {
    const cacheKey = new Request(c.req.url.toString(), c.req)
    const cache = caches.default
    let response = await cache.match(cacheKey)

    if (response) return response

    const { drizzle } = getConnection(c.env)

    const assetTag = await drizzle.query.assetTag.findFirst({
        where: (assetTag, { eq }) => eq(assetTag.id, c.req.param("id")),
    })

    response = c.json(
        {
            success: true,
            status: "ok",
            assetTag,
        },
        200
    )

    response.headers.set("Cache-Control", "s-maxage=604800")
    await cache.put(cacheKey, response.clone())

    return response
}
