import { auth } from "@/v2/lib/auth/lucia"
import { getConnection } from "@/v2/db/turso"

import { userCollectionAssets } from "@/v2/db/schema"

export async function addAssetToCollection(c: APIContext): Promise<Response> {
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
        assetId: formData.get("assetId") as string | null,
    }

    if (!collection.id) {
        c.status(200)
        return c.json({ success: false, state: "no collection id entered" })
    }

    if (!collection.assetId) {
        c.status(401)
        return c.json({ success: false, state: "no asset id entered" })
    }

    // check if collection exists
    const collectionExists = await drizzle.query.userCollections.findFirst({
        where: (userCollections, { eq }) =>
            eq(userCollections.id, collection.id),
    })

    if (!collectionExists) {
        c.status(200)
        return c.json({
            success: false,
            state: "collection with ID doesn't exist",
        })
    }

    // check if asset exists, and status is 1 (approved)
    const assetExists = await drizzle.query.assets.findFirst({
        where: (assets, { eq, and }) =>
            and(
                eq(assets.id, parseInt(collection.assetId)),
                eq(assets.status, 1)
            ),
    })

    if (!assetExists) {
        c.status(200)
        return c.json({ success: false, state: "asset not found" })
    }

    // check if userCollectionAssets exists
    const userCollectionAssetsExists =
        await drizzle.query.userCollectionAssets.findFirst({
            where: (userCollectionAssets, { eq, and }) =>
                and(
                    eq(userCollectionAssets.collectionId, collection.id),
                    eq(
                        userCollectionAssets.assetId,
                        parseInt(collection.assetId)
                    )
                ),
        })

    if (userCollectionAssetsExists) {
        c.status(200)
        return c.json({
            success: false,
            state: "asset already exists in collection",
        })
    }

    // create entry in userCollectionAssets
    try {
        await drizzle
            .insert(userCollectionAssets)
            .values({
                id: crypto.randomUUID(),
                collectionId: collection.id,
                assetId: parseInt(collection.assetId),
            })
            .execute()
    } catch (e) {
        c.status(500)
        return c.json(
            { success: false, state: "failed to add asset to collection" },
            500
        )
    }

    return c.json({ success: true, state: "added asset to collection" }, 200)
}
