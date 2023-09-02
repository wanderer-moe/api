import { auth } from "@/v2/lib/auth/lucia"
import { getConnection } from "@/v2/db/turso"
import { APIContext as Context } from "@/worker-configuration"
import { favoritedAssets } from "@/v2/db/schema"

export async function favoriteAsset(c: Context): Promise<Response> {
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

	const assetToFavorite = formData.get("assetIdToFavorite") as string | null

	if (!assetToFavorite) {
		return c.json({ success: false, state: "no assetid entered" }, 200)
	}

	// check if asset exists
	const asset = await drizzle.query.assets.findFirst({
		where: (assets, { eq }) => eq(assets.id, parseInt(assetToFavorite)),
	})

	if (!asset) {
		return c.json({ success: false, state: "asset not found" }, 200)
	}

	// this should never happen, but just in case it does, UX over reads/writes to the database
	let userFavoritedAssets = await drizzle.query.favoritedAssets.findFirst({
		where: (favoritedAssets, { eq }) =>
			eq(favoritedAssets.userId, session.userId),
	})

	if (!userFavoritedAssets) {
		// create entry in favoritedAssets
		const insertedFavoritedAsset = await drizzle
			.insert(favoritedAssets)
			.values({
				id: `${session.userId}-${assetToFavorite}`,
				userId: session.userId,
				isPublic: 0, // default to private
			})
			.execute()
		userFavoritedAssets = insertedFavoritedAsset[0]
	}

	const isFavorited = drizzle.query.favoritedAssets.findFirst({
		where: (favoritedAssets, { eq }) =>
			eq(favoritedAssets.id, `${session.userId}-${assetToFavorite}`),
		with: {
			assets: {
				where: (assets, { eq }) =>
					eq(assets.id, parseInt(assetToFavorite)),
			},
		},
	})

	if (isFavorited) {
		return c.json(
			{
				success: false,
				state: "asset is already favorited",
				assetToFavorite,
			},
			200
		)
	}

	// add asset to favoritedAssets...

	return c.json(
		{ success: true, state: "favorited asset", assetToFavorite },
		200
	)
}
