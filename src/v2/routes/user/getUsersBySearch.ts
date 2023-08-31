import { responseHeaders } from "@/v2/lib/responseHeaders"
import { createNotFoundResponse } from "@/v2/lib/helpers/responses/notFoundResponse"
import { like } from "drizzle-orm"
import { getConnection } from "@/v2/db/turso"
import { users } from "@/v2/db/schema"
import type { APIContext as Context } from "@/worker-configuration"

export async function getUsersBySearch(c: Context): Promise<Response> {
    const cacheKey = new Request(c.req.url.toString(), c.req)
    const cache = caches.default
    let response = await cache.match(cacheKey)
    if (response) return response

    const { query } = c.req.param()
    const conn = await getConnection(c.env)
    const { drizzle } = conn

    const userList = await drizzle
        .select()
        .from(users)
        .where(like(users.username, `%${query}%`))
        .execute()

    if (!userList) {
        return createNotFoundResponse(c, "Users not found", responseHeaders)
    }

    response = c.json(
        {
            success: true,
            status: "ok",
            query,
            results: userList,
        },
        200,
        responseHeaders
    )

    response.headers.set("Cache-Control", "s-maxage=60")
    await cache.put(cacheKey, response.clone())

    return response
}
