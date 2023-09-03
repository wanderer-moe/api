import { responseHeaders } from "@/v2/lib/responseHeaders"
import { getConnection } from "@/v2/db/turso"
import { createNotFoundResponse } from "@/v2/lib/helpers/responses/notFoundResponse"
import type { APIContext as Context } from "@/worker-configuration"
import { desc } from "drizzle-orm"
import { assets, userCollections } from "@/v2/db/schema"
import { auth } from "@/v2/lib/auth/lucia"
import { roleFlagsToArray } from "@/v2/lib/helpers/roleFlags"

export async function getUserByUsername(c: Context): Promise<Response> {
	const { username } = c.req.param()
	const cacheKey = new Request(c.req.url.toString(), c.req)
	const cache = caches.default
	let response = await cache.match(cacheKey)

	const authRequest = auth(c.env).handleRequest(c)
	const session = await authRequest.validate()

	if (!session || session.state === "idle" || session.state === "invalid") {
		if (session) {
			await auth(c.env).invalidateSession(session.sessionId)
			authRequest.setSession(null)
		}
	}

	if (response) return response
	const drizzle = await getConnection(c.env).drizzle

	const user = await drizzle.query.users.findFirst({
		where: (users, { and, eq }) => and(eq(users.username, username)),
		with: {
			assets: {
				orderBy: desc(assets.uploadedDate),
				limit: 100,
				where: (assets, { eq }) => eq(assets.status, 1),
			},
			userCollections: {
				orderBy: desc(userCollections.dateCreated),
				where: (userCollections, { eq, or }) =>
					or(
						eq(userCollections.isPublic, 1),
						session && eq(userCollections.userId, session.userId)
					),
				limit: 5,
				with: {
					assets: {
						orderBy: desc(assets.uploadedDate),
						limit: 100,
						where: (assets, { eq }) => eq(assets.status, 1),
					},
				},
			},
			userFavorites: {
				where: (userFavorites, { eq }) => eq(userFavorites.isPublic, 1),
				with: {
					assets: {
						orderBy: desc(assets.uploadedDate),
						limit: 100,
						where: (assets, { eq }) => eq(assets.status, 1),
					},
				},
			},
			savedOcGenerators: {
				where: (savedOcGenerators, { eq, or }) =>
					or(
						eq(savedOcGenerators.isPublic, 1),
						session && eq(savedOcGenerators.userId, session.userId)
					),
			},
		},
	})

	if (!user) {
		response = createNotFoundResponse(c, "User not found", responseHeaders)
		await cache.put(cacheKey, response.clone())
		return response
	}

	// removing email-related fields
	user.email = undefined
	user.emailVerified = undefined

	response = c.json(
		{
			success: true,
			status: "ok",
			accountIsAuthed: session.userId ? true : false,
			userIsQueryingOwnAccount:
				session && session.userId === user.id ? true : false,
			userRoleFlagsArray: roleFlagsToArray(user.roleFlags),
			user,
		},
		200,
		responseHeaders
	)

	response.headers.set("Cache-Control", "s-maxage=120")
	await cache.put(cacheKey, response.clone())

	return response
}
