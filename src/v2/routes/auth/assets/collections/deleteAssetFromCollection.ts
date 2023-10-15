import { auth } from "@/v2/lib/auth/lucia"
import { getConnection } from "@/v2/db/turso"

import { userCollectionAssets } from "@/v2/db/schema"
import { eq } from "drizzle-orm"

export async function deleteAssetFromCollection(
    c: APIContext
): Promise<Response> {
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
        return c.json({ success: false, state: "no asset id entered" }, 401)
    }

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

    // check if asset exists
    const assetExists = await drizzle.query.assets.findFirst({
        where: (assets, { eq }) => eq(assets.id, parseInt(collection.assetId)),
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

    if (!userCollectionAssetsExists) {
        return c.json({
            success: false,
            state: "asset not found in collection",
        })
    }

    try {
        await drizzle
            .delete(userCollectionAssets)
            .where(eq(userCollectionAssets.id, userCollectionAssetsExists.id))
            .execute()
    } catch (e) {
        return c.json(
            {
                success: false,
                state: "failed to delete asset from collection",
            },
            500
        )
    }

    return c.json(
        { success: true, state: "deleted asset from collection" },
        200
    )
}
