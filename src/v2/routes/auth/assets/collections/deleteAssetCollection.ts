import { auth } from "@/v2/lib/auth/lucia"
import { getConnection } from "@/v2/db/turso"
import { z } from "zod"
import { eq } from "drizzle-orm"
import { userCollections } from "@/v2/db/schema"

const DeleteAssetCollectionSchema = z.object({
    collectionId: z.string({
        required_error: "Collection ID is required",
        invalid_type_error: "Collection ID must be a string",
    }),
})

export async function deleteAssetCollection(c: APIContext): Promise<Response> {
    const formData = DeleteAssetCollectionSchema.safeParse(
        await c.req.formData()
    )

    if (!formData.success) {
        return c.json({ success: false, state: "invalid data" }, 400)
    }

    const { collectionId } = formData.data

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

    // check if collection exists
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

    // delete collection
    await drizzle
        .delete(userCollections)
        .where(eq(userCollections.id, collectionId))
        .execute()

    return c.json({ success: true, state: "collection deleted" }, 200)
}
