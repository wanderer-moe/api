import { responseHeaders } from "@/v2/lib/responseHeaders"
import { createNotFoundResponse } from "@/v2/lib/helpers/responses/notFoundResponse"
import { getConnection } from "@/v2/db/turso"
import { like } from "drizzle-orm"
import type { APIContext as Context } from "@/worker-configuration"

export async function getUsersBySearch(c: Context): Promise<Response> {
	const cacheKey = new Request(c.req.url.toString(), c.req)
	const cache = caches.default
	let response = await cache.match(cacheKey)
	if (response) return response

	const { query } = c.req.param()
	const drizzle = await getConnection(c.env).drizzle

	const userList = await drizzle.query.users.findMany({
		where: (users, { or }) => {
			return or(like(users.username, `%${query}%`))
		},
	})

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
