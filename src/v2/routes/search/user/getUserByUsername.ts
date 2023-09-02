import { responseHeaders } from "@/v2/lib/responseHeaders"
import { getConnection } from "@/v2/db/turso"
import { createNotFoundResponse } from "@/v2/lib/helpers/responses/notFoundResponse"
import type { APIContext as Context } from "@/worker-configuration"
import { roleFlagsToArray } from "@/v2/lib/helpers/roleFlags"

export async function getUserByUsername(c: Context): Promise<Response> {
	const { username } = c.req.param()
	const cacheKey = new Request(c.req.url.toString(), c.req)
	const cache = caches.default
	let response = await cache.match(cacheKey)

	if (response) return response

	const drizzle = await getConnection(c.env).drizzle

	const user = await drizzle.query.users.findFirst({
		where: (users, { eq }) => eq(user.username, username),
	})

	if (!user) {
		response = createNotFoundResponse(c, "User not found", responseHeaders)
		await cache.put(cacheKey, response.clone())
		return response
	}

	// removing email-related fields
	user.email = undefined
	user.emailVerified = undefined

	// converting role flags to array
	user.roleFlags = roleFlagsToArray(user.role_flags)

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
