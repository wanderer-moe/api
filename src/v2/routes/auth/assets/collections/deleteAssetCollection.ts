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

    // delete collection
    await drizzle
        .delete(userCollections)
        .where(eq(userCollections.id, collection.id))
        .execute()

    c.status(200)
    return c.json({ success: true, state: "collection deleted" })
}
