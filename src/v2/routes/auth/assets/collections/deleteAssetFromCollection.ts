import { auth } from "@/v2/lib/auth/lucia"
import { getConnection } from "@/v2/db/turso"
import { z } from "zod"
import { userCollectionAssets } from "@/v2/db/schema"
import { eq } from "drizzle-orm"

const DeleteAssetFromCollectionSchema = z.object({
    collectionId: z.string({
        required_error: "Collection ID is required",
        invalid_type_error: "Collection ID must be a string",
    }),
    assetId: z.string({
        required_error: "Asset ID is required",
        invalid_type_error: "Asset ID must be a string",
    }),
})

export async function deleteAssetFromCollection(
    c: APIContext
): Promise<Response> {
    const formData = DeleteAssetFromCollectionSchema.safeParse(
        await c.req.formData()
    )

    if (!formData.success) {
        return c.json({ success: false, state: "invalid data" }, 400)
    }

    const { collectionId, assetId } = formData.data

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

    if (!collectionId) {
        return c.json(
            { success: false, state: "no collection id entered" },
            200
        )
    }

    if (!assetId) {
        return c.json({ success: false, state: "no asset id entered" }, 401)
    }

    const collectionExists = await drizzle.query.userCollections.findFirst({
        where: (userCollections, { eq }) =>
            eq(userCollections.id, collectionId),
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
        where: (assets, { eq }) => eq(assets.id, parseInt(collectionId)),
    })

    if (!assetExists) {
        return c.json({ success: false, state: "asset not found" }, 200)
    }

    // check if userCollectionAssets exists
    const userCollectionAssetsExists =
        await drizzle.query.userCollectionAssets.findFirst({
            where: (userCollectionAssets, { eq, and }) =>
                and(
                    eq(userCollectionAssets.collectionId, collectionId),
                    eq(userCollectionAssets.assetId, parseInt(assetId))
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
