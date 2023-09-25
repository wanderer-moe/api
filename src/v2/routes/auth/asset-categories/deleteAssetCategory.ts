import { auth } from "@/v2/lib/auth/lucia"
import { roleFlagsToArray } from "@/v2/lib/helpers/roleFlags"
import { getConnection } from "@/v2/db/turso"

import { eq } from "drizzle-orm"
import { assetCategories } from "@/v2/db/schema"

export async function deleteAssetCategory(c: APIContext): Promise<Response> {
    const authRequest = auth(c.env).handleRequest(c)
    const session = await authRequest.validate()

    if (!session || session.state === "idle") {
        if (session) {
            await auth(c.env).invalidateSession(session.sessionId)
            authRequest.setSession(null)
        }
        c.status(401)
        return c.json({ success: false, state: "unauthorized" })
    }

    const roleFlags = roleFlagsToArray(session.user.roleFlags)

    if (!roleFlags.includes("CREATOR")) {
        c.status(401)
        return c.json({ success: false, state: "unauthorized" })
    }

    const drizzle = getConnection(c.env).drizzle

    const formData = await c.req.formData()

    const assetCategory = {
        id: formData.get("id") as string | null,
    }

    if (!assetCategory.id) {
        c.status(200)
        return c.json({ success: false, state: "no id entered" })
    }

    // check if assetCategory exists
    const assetCategoryExists = await drizzle.query.assetCategories.findFirst({
        where: (assetCategories, { eq }) =>
            eq(assetCategories.id, assetCategory.id),
    })

    if (!assetCategoryExists) {
        c.status(200)
        return c.json({
            success: false,
            state: "assetCategory with ID doesn't exist",
        })
    }

    try {
        await drizzle
            .delete(assetCategories)
            .where(eq(assetCategories.id, assetCategory.id))
            .execute()
    } catch (e) {
        return c.json(
            { success: false, state: "failed to delete assetCategory" },
            200
        )
    }

    return c.json(
        { success: true, state: "deleted assetCategory", assetCategory },
        200
    )
}
