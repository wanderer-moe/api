import { auth } from "@/v2/lib/auth/lucia"
import { getConnection } from "@/v2/db/turso"

export async function viewAssetCollection(c: APIContext): Promise<Response> {
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

    const formData = await c.req.formData()

    const collection = {
        id: formData.get("collectionId") as string | null,
    }

    if (!collection.id) {
        c.status(200)
        return c.json({ success: false, state: "no collection id entered" })
    }

    // check if the user owns the collection, or if the collection is public
    try {
        await drizzle.query.userCollections.findFirst({
            where: (userCollections, { eq, or, and }) =>
                and(
                    or(
                        eq(userCollections.id, collection.id),
                        eq(userCollections.isPublic, 1)
                    ),
                    eq(userCollections.userId, session.userId)
                ),
        })
    } catch (e) {
        c.status(200)
        return c.json({
            success: false,
            state: "collection with ID doesn't exist",
        })
    }

    const assetCollection = await drizzle.query.userCollections.findFirst({
        where: (userCollections, { eq, or, and }) =>
            and(
                or(
                    eq(userCollections.id, collection.id),
                    eq(userCollections.isPublic, 1)
                ),
                eq(userCollections.userId, session.userId)
            ),
        with: {
            userCollectionAssets: {
                with: {
                    assets: true,
                },
            },
        },
    })

    c.status(200)
    return c.json({ success: true, state: "found collection", assetCollection })
}
