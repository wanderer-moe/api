import { auth } from "@/v2/lib/auth/lucia"
import { roleFlagsToArray } from "@/v2/lib/helpers/roleFlags"
import { getConnection } from "@/v2/db/turso"

import { assetTags } from "@/v2/db/schema"

export async function createTag(c: APIContext): Promise<Response> {
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

    const roleFlags = roleFlagsToArray(session.user.role_flags)

    if (!roleFlags.includes("CREATOR")) {
        c.status(401)
        return c.json({ success: false, state: "unauthorized" })
    }

    const drizzle = getConnection(c.env).drizzle

    const formData = await c.req.formData()

    const tag = {
        id: crypto.randomUUID(),
        name: formData.get("name") as string,
        formattedName: formData.get("formattedName") as string,
        assetCount: 0,
        lastUpdated: new Date().getTime(), // unix timestamp
    }

    // check if tag.name exists
    const tagExists = await drizzle.query.assetTags.findFirst({
        where: (assetTags, { eq }) => eq(assetTags.name, tag.name),
    })

    if (tagExists) {
        c.status(200)
        return c.json({ success: false, state: "tag with name already exists" })
    }

    try {
        await drizzle.insert(assetTags).values(tag).execute()
    } catch (e) {
        c.status(200)
        return c.json({ success: false, state: "failed to create tag" })
    }

    c.status(200)
    return c.json({ success: true, state: "created tag", tag })
}
