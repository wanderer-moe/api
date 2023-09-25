import { auth } from "@/v2/lib/auth/lucia"
import { getConnection } from "@/v2/db/turso"

import { userCollections } from "@/v2/db/schema"

export async function createAssetCollection(c: APIContext): Promise<Response> {
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
        name: formData.get("collectionName") as string | null,
        description: formData.get("collectionDescription") as string | null,
    }

    if (!collection.name) {
        c.status(200)
        return c.json({ success: false, state: "no collection name entered" })
    }

    if (!collection.description) {
        c.status(200)
        return c.json({
            success: false,
            state: "no collection description entered",
        })
    }

    // check if collection exists
    const collectionExists = await drizzle.query.userCollections.findFirst({
        where: (userCollections, { eq }) =>
            eq(userCollections.name, collection.name),
    })

    if (collectionExists) {
        c.status(200)
        return c.json({
            success: false,
            state: "collection with name already exists",
        })
    }

    // create entry in userCollections
    try {
        await drizzle
            .insert(userCollections)
            .values({
                id: crypto.randomUUID(),
                name: collection.name,
                description: collection.description,
                userId: session.user.userId,
                dateCreated: new Date().getTime(),
                isPublic: 0, // default to private
            })
            .execute()
    } catch (e) {
        c.status(200)
        return c.json({ success: false, state: "failed to create collection" })
    }

    c.status(200)
    return c.json({ success: true, state: "created collection" })
}
