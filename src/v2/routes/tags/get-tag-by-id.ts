import { assetTag } from "@/v2/db/schema"
import { getConnection } from "@/v2/db/turso"
import { eq } from "drizzle-orm"

export async function getTagById(c: APIContext): Promise<Response> {
    const cacheKey = new Request(c.req.url.toString(), c.req)
    const cache = caches.default
    let response = await cache.match(cacheKey)

    if (response) return response

    const { drizzle } = getConnection(c.env)

    const result = await drizzle
        .select()
        .from(assetTag)
        .where(eq(assetTag.name, c.req.param("id")))

    response = c.json(
        {
            success: true,
            status: "ok",
            result,
        },
        200
    )

    response.headers.set("Cache-Control", "s-maxage=120")
    await cache.put(cacheKey, response.clone())

    return response
}
