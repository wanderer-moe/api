import { responseHeaders } from "@/v2/lib/responseHeaders"
import { getConnection } from "@/v2/db/turso"
import { users } from "@/v2/db/schema"
import { eq } from "drizzle-orm"
import { createNotFoundResponse } from "@/v2/lib/helpers/responses/notFoundResponse"
import type { APIContext as Context } from "@/worker-configuration"

export async function getUserByUsername(c: Context): Promise<Response> {
    const { username } = c.req.param()
    const cacheKey = new Request(c.req.url.toString(), c.req)
    const cache = caches.default
    let response = await cache.match(cacheKey)

    if (response) return response

    const drizzle = await getConnection(c.env).drizzle

    const user = await drizzle
        .select()
        .from(users)
        .where(eq(users.username, username))
        .execute()

    if (!user) {
        return createNotFoundResponse(c, "User not found", responseHeaders)
    }

    // removing email-related fields
    user[0].email = undefined
    user[0].emailVerified = undefined

    response = c.json(
        {
            success: true,
            status: "ok",
            user,
        },
        200,
        responseHeaders
    )

    response.headers.set("Cache-Control", "s-maxage=300")
    await cache.put(cacheKey, response.clone())

    return response
}
