import { auth } from "@/v2/lib/auth/lucia"
import { getConnection } from "@/v2/db/turso"
import { APIContext as Context } from "@/worker-configuration"

export async function viewFavoriteAssets(c: Context): Promise<Response> {
	const drizzle = getConnection(c.env).drizzle

	const authRequest = auth(c.env).handleRequest(c)
	const session = await authRequest.validate()

	if (!session || session.state === "idle" || session.state === "invalid") {
		if (session) {
			await auth(c.env).invalidateSession(session.sessionId)
			authRequest.setSession(null)
		}
		return c.json({ success: false, state: "invalid session" }, 200)
	}

	// check if userFavorites exists
	const userFavoritesExists = await drizzle.query.userFavorites.findFirst({
		where: (userFavorites, { eq }) =>
			eq(userFavorites.userId, session.userId),
	})

	if (!userFavoritesExists) {
		return c.json({ success: false, state: "no favorites found" }, 200)
	}

	const favoriteAssets = await drizzle.query.userFavoritesAssets.findMany({
		where: (userFavoritesAssets, { eq }) =>
			eq(userFavoritesAssets.userFavoritesId, userFavoritesExists.id),
		with: {
			assets: true,
		},
	})

	return c.json(
		{ success: true, state: "found favorites", favoriteAssets },
		200
	)
}
