import { responseHeaders } from "@/lib/responseHeaders"
import { getConnection } from "@/db/turso"
import { listBucket } from "@/lib/listBucket"
import { games } from "@/db/schema"
import type { Context } from "hono"

export async function getAllGames(c: Context): Promise<Response> {
    const cacheKey = new Request(c.req.url.toString(), c.req)
    const cache = caches.default
    let response = await cache.match(cacheKey)

    if (response) return response

    const files = await listBucket(c.env.bucket, {
        prefix: "oc-generators/",
        delimiter: "/",
    })

    const results = files.delimitedPrefixes.map((file) => {
        return {
            name: file.replace("oc-generators/", "").replace("/", ""),
        }
    })

    const conn = await getConnection(c.env)
    const { drizzle } = conn

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
