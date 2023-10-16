import { responseHeaders } from "@/v2/lib/responseHeaders"
import { getConnection } from "@/v2/db/turso"
import { listBucket } from "@/v2/lib/listBucket"
import { games } from "@/v2/db/schema"

export async function getAllGames(c: APIContext): Promise<Response> {
    const cacheKey = new Request(c.req.url.toString(), c.req)
    const cache = caches.default
    let response = await cache.match(cacheKey)

    if (response) return response

    const files = await listBucket(c.env.FILES_BUCKET, {
        prefix: "oc-generators/",
        delimiter: "/",
    })

    const results = files.delimitedPrefixes.map((file) => {
        return {
            name: file.replace("oc-generators/", "").replace("/", ""),
        }
    })

    const { drizzle } = getConnection(c.env)

    const gamesList = await drizzle
        .select()
        .from(games)
        .execute()
        .then((row) =>
            row.map((game) => ({
                ...game,
                has_generator: results.some(
                    (generator) => generator.name === game.name
                ),
            }))
        )

    response = c.json(
        {
            success: true,
            status: "ok",
            results: gamesList,
        },
        200,
        responseHeaders
    )

    response.headers.set("Cache-Control", "s-maxage=1200")
    await cache.put(cacheKey, response.clone())

    return response
}
