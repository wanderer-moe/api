import { auth } from "@/v2/lib/auth/lucia"
import { getConnection } from "@/v2/db/turso"

import { userCollectionAssets } from "@/v2/db/schema"

export async function addAssetToCollection(c: APIContext): Promise<Response> {
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

    const formData = await c.req.formData()

    const collection = {
        id: formData.get("collectionId") as string | null,
        assetId: formData.get("assetId") as string | null,
    }

    if (!collection.id) {
        return c.json(
            { success: false, state: "no collection id entered" },
            200
        )
    }

    if (!collection.assetId) {
        return c.json({ success: false, state: "no asset id entered" }, 200)
    }

    // check if collection exists
    const collectionExists = await drizzle.query.userCollections.findFirst({
        where: (userCollections, { eq }) =>
            eq(userCollections.id, collection.id),
    })

    if (!collectionExists) {
        return c.json(
            {
                success: false,
                state: "collection with ID doesn't exist",
            },
            200
        )
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
        return c.json({ success: false, state: "asset not found" }, 200)
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
        return c.json(
            {
                success: false,
                state: "asset already exists in collection",
            },
            200
        )
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
        return c.json(
            { success: false, state: "failed to add asset to collection" },
            500
        )
    }

    return c.json({ success: true, state: "added asset to collection" }, 200)
}
