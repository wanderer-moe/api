import { auth } from "@/v2/lib/auth/lucia"
import { getConnection } from "@/v2/db/turso"
import { APIContext as Context } from "@/worker-configuration"

export async function viewAssetCollections(c: Context): Promise<Response> {
	const drizzle = getConnection(c.env).drizzle

	const authRequest = auth(c.env).handleRequest(c)
	const session = await authRequest.validate()

	if (!session || session.state === "idle" || session.state === "invalid") {
		if (session) {
			await auth(c.env).invalidateSession(session.sessionId)
			authRequest.setSession(null)
		}
		c.status(401)
		return c.json({ success: false, state: "invalid session" })
	}

	// check if userCollections exists
	const userCollectionsExists = await drizzle.query.userCollections.findFirst(
		{
			where: (userCollections, { eq }) =>
				eq(userCollections.userId, session.userId),
		}
	)

	if (!userCollectionsExists) {
		c.status(200)
		return c.json({ success: false, state: "no collections found" })
	}

	const assetCollection = await drizzle.query.userCollectionAssets.findMany({
		where: (userCollectionAssets, { eq }) =>
			eq(userCollectionAssets.collectionId, userCollectionsExists.id),
		with: {
			assets: true,
		},
	})

	c.status(200)
	return c.json({
		success: true,
		state: "found collections",
		assetCollection,
	})
}
