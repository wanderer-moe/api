import { getConnection } from "@/v2/db/turso"
import { like } from "drizzle-orm"

export async function getUsersBySearch(c: APIContext): Promise<Response> {
    const cacheKey = new Request(c.req.url.toString(), c.req)
    const cache = caches.default
    let response = await cache.match(cacheKey)
    if (response) return response

    const { query } = c.req.param()
    const { drizzle } = getConnection(c.env)

    const userList = await drizzle.query.users.findMany({
        where: (users, { or }) => {
            return or(like(users.username, `%${query}%`))
        },
        columns: {
            email: false,
            emailVerified: false,
        },
        limit: 25,
    })

    if (!userList) {
        return c.json(
            {
                success: false,
                status: "user not found",
            },
            200
        )
    }

    response = c.json(
        {
            success: true,
            status: "ok",
            query,
            results: userList,
        },
        200
    )

    response.headers.set("Cache-Control", "s-maxage=60")
    await cache.put(cacheKey, response.clone())

    return response
}