import { auth } from "@/v2/lib/auth/lucia"
import { getConnection } from "@/v2/db/turso"

export async function viewAssetCollection(c: APIContext): Promise<Response> {
    const drizzle = getConnection(c.env).drizzle

    const authRequest = auth(c.env).handleRequest(c)
    const session = await authRequest.validate()

    if (!session || session.state === "idle") {
        if (session) {
            await auth(c.env).invalidateSession(session.sessionId)
            authRequest.setSession(null)
        }
        return c.json({ success: false, state: "invalid session" }, 401)
    }

    const collectionId = c.req.param("collectionId")

    if (!collectionId) {
        return c.json(
            { success: false, state: "no collection id entered" },
            200
        )
    }

    // check if the user owns the collection, or if the collection is public
    try {
        await drizzle.query.userCollections.findFirst({
            where: (userCollections, { eq, or, and }) =>
                and(
                    or(
                        eq(userCollections.id, collectionId),
                        eq(userCollections.isPublic, 1)
                    ),
                    eq(userCollections.userId, session.user.userId)
                ),
        })
    } catch (e) {
        return c.json(
            {
                success: false,
                state: "collection with ID doesn't exist",
            },
            200
        )
    }

    const assetCollection = await drizzle.query.userCollections.findFirst({
        where: (userCollections, { eq, or, and }) =>
            and(
                or(
                    eq(userCollections.id, collectionId),
                    eq(userCollections.isPublic, 1)
                ),
                eq(userCollections.userId, session.user.userId)
            ),
        with: {
            userCollectionAssets: {
                with: {
                    assets: true,
                },
            },
        },
    })

    return c.json(
        { success: true, state: "found collection", assetCollection },
        200
    )
}
