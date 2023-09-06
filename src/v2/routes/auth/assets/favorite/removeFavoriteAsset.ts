import { auth } from "@/v2/lib/auth/lucia"
import { getConnection } from "@/v2/db/turso"
import { eq } from "drizzle-orm"
import { APIContext as Context } from "@/worker-configuration"
import { userFavorites, userFavoritesAssets } from "@/v2/db/schema"

export async function removeFavoriteAsset(c: Context): Promise<Response> {
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

	const formData = await c.req.formData()
	const assetToRemove = formData.get("assetToRemove") as string | null

	if (!assetToRemove) {
		return c.json({ success: false, state: "no assetid entered" }, 200)
	}

	// check if asset exists
	const asset = await drizzle.query.assets.findFirst({
		where: (assets, { eq }) => eq(assets.id, parseInt(assetToRemove)),
	})

	if (!asset) {
		return c.json({ success: false, state: "asset not found" }, 200)
	}

	// this should never happen, but just in case it does, UX over reads/writes to the database
	const doesUserFavoritesExist = await drizzle.query.userFavorites.findFirst({
		where: (userFavorites, { eq }) =>
			eq(userFavorites.userId, session.userId),
	})

	if (!doesUserFavoritesExist) {
		// create entry in userFavorites
		await drizzle
			.insert(userFavorites)
			.values({
				id: `${session.userId}-${assetToRemove}`,
				userId: session.userId,
				isPublic: 0, // default to private
			})
			.execute()
	}

	const isFavorited = await drizzle.query.userFavorites.findFirst({
		where: (userFavoritesAssets, { eq }) =>
			eq(userFavoritesAssets.id, `${session.userId}-${assetToRemove}`),
	})

	if (!isFavorited) {
		c.status(200)
		return c.json({
			success: false,
			state: "asset is not favorited, therefore cannot be removed",
			assetToRemove,
		})
	}

	// remove asset from userFavorites...
	try {
		await drizzle
			.delete(userFavoritesAssets)
			.where(
				eq(userFavoritesAssets.id, `${session.userId}-${assetToRemove}`)
			)
			.execute()
	} catch (e) {
		c.status(500)
		return c.json({ success: false, state: "failed to remove asset" })
	}

	c.status(200)
	return c.json({ success: true, state: "removed asset", assetToRemove })
}
