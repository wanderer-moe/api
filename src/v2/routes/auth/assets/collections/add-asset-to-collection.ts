import { auth } from "@/v2/lib/auth/lucia"
import { getConnection } from "@/v2/db/turso"
import { z } from "zod"
import { userCollectionAsset } from "@/v2/db/schema"

const AddAssetToCollectionSchema = z.object({
    collectionId: z.string({
        required_error: "Collection ID is required",
        invalid_type_error: "Collection ID must be a string",
    }),
    assetId: z.string({
        required_error: "Asset ID is required",
        invalid_type_error: "Asset ID must be a string",
    }),
})

export async function addAssetToCollection(c: APIContext): Promise<Response> {
    const formData = AddAssetToCollectionSchema.safeParse(
        await c.req.formData().then((formData) => {
            const data = Object.fromEntries(formData.entries())
            return data
        })
    )

    if (!formData.success) {
        return c.json({ success: false, state: "invalid data" }, 400)
    }

    const { collectionId, assetId } = formData.data

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

    if (!collectionId) {
        return c.json(
            { success: false, state: "no collection id entered" },
            200
        )
    }

    if (!assetId) {
        return c.json({ success: false, state: "no asset id entered" }, 200)
    }

    // check if collection exists
    const collectionExists = await drizzle.query.userCollection.findFirst({
        where: (userCollection, { eq }) => eq(userCollection.id, collectionId),
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
                eq(assets.id, parseInt(assetId)),
                eq(assets.status, "approved")
            ),
    })

    if (!assetExists) {
        return c.json({ success: false, state: "asset not found" }, 200)
    }

    // check if userCollectionAsset exists
    const userCollectionAssetExists =
        await drizzle.query.userCollectionAsset.findFirst({
            where: (userCollectionAsset, { eq, and }) =>
                and(
                    eq(userCollectionAsset.collectionId, collectionId),
                    eq(userCollectionAsset.assetId, parseInt(assetId))
                ),
        })

    if (userCollectionAssetExists) {
        return c.json(
            {
                success: false,
                state: "asset already exists in collection",
            },
            200
        )
    }

    // create entry in userCollectionAsset
    try {
        await drizzle
            .insert(userCollectionAsset)
            .values({
                id: crypto.randomUUID(),
                collectionId: collectionId,
                assetId: parseInt(assetId),
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
