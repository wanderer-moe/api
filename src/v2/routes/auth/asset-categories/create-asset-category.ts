import { auth } from "@/v2/lib/auth/lucia"
import { roleFlagsToArray } from "@/v2/lib/helpers/role-flags"
import { getConnection } from "@/v2/db/turso"
import { assetCategory } from "@/v2/db/schema"

export async function createAssetCategory(c: APIContext): Promise<Response> {
    const authRequest = auth(c.env).handleRequest(c)
    const session = await authRequest.validate()

    if (!session || session.state === "idle") {
        if (session) {
            await auth(c.env).invalidateSession(session.sessionId)
            authRequest.setSession(null)
        }
        return c.json({ success: false, state: "unauthorized" }, 401)
    }

    const roleFlags = roleFlagsToArray(session.user.roleFlags)

    if (!roleFlags.includes("CREATOR")) {
        return c.json({ success: false, state: "unauthorized" }, 401)
    }

    const { drizzle } = getConnection(c.env)

    const formData = await c.req.formData()

    const newAssetCategory = {
        id: crypto.randomUUID(),
        name: formData.get("name") as string,
        formattedName: formData.get("formattedName") as string,
        assetCount: 0,
        lastUpdated: new Date().toISOString(),
    }

    // check if assetCategory.name exists
    const assetCategoryExists = await drizzle.query.assetCategory.findFirst({
        where: (assetCategory, { eq }) =>
            eq(assetCategory.name, assetCategory.name),
    })

    if (assetCategoryExists) {
        return c.json(
            {
                success: false,
                state: "assetCategory with name already exists",
            },
            200
        )
    }

    try {
        await drizzle.insert(assetCategory).values(newAssetCategory).execute()
    } catch (e) {
        return c.json(
            {
                success: false,
                state: "failed to create assetCategory",
            },
            500
        )
    }

    return c.json(
        { success: true, state: "created assetcategory", assetCategory },
        200
    )
}
