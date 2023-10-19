import { auth } from "@/v2/lib/auth/lucia"
import { getConnection } from "@/v2/db/turso"

export async function viewAssetCollections(c: APIContext): Promise<Response> {
    const { drizzle } = getConnection(c.env)

    const authRequest = auth(c.env).handleRequest(c)
    const session = await authRequest.validate()

    if (!session || session.state === "idle") {
        if (session) {
            await auth(c.env).invalidateSession(session.sessionId)
            authRequest.setSession(null)
        }
        return c.json({ success: false, state: "invalid session" }, 401)
    }

    // check if userCollection exists
    const userCollectionExists = await drizzle.query.userCollection.findFirst({
        where: (userCollection, { eq }) =>
            eq(userCollection.userId, session.user.userId),
    })

    if (!userCollectionExists) {
        return c.json({ success: false, state: "no collections found" }, 200)
    }

    const assetCollection = await drizzle.query.userCollectionAsset.findMany({
        where: (userCollectionAsset, { eq }) =>
            eq(userCollectionAsset.collectionId, userCollectionExists.id),
        with: {
            assets: true,
        },
    })

    return c.json(
        {
            success: true,
            state: "found collections",
            assetCollection,
        },
        200
    )
}
