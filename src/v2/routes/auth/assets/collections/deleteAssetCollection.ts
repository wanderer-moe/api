import { auth } from "@/v2/lib/auth/lucia"
import { getConnection } from "@/v2/db/turso"

import { eq } from "drizzle-orm"
import { userCollections } from "@/v2/db/schema"

export async function deleteAssetCollection(c: APIContext): Promise<Response> {
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
    }

    if (!collection.id) {
        return c.json(
            { success: false, state: "no collection id entered" },
            200
        )
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

    // delete collection
    await drizzle
        .delete(userCollections)
        .where(eq(userCollections.id, collection.id))
        .execute()

    return c.json({ success: true, state: "collection deleted" }, 200)
}
