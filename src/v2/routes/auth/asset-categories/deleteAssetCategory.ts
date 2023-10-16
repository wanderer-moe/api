import { auth } from "@/v2/lib/auth/lucia"
import { roleFlagsToArray } from "@/v2/lib/helpers/roleFlags"
import { getConnection } from "@/v2/db/turso"
import { z } from "zod"
import { eq } from "drizzle-orm"
import { assetCategories } from "@/v2/db/schema"

const DeleteAssetCategorySchema = z.object({
    id: z.string({
        required_error: "ID is required",
        invalid_type_error: "ID must be a string",
    }),
})

export async function deleteAssetCategory(c: APIContext): Promise<Response> {
    const formData = DeleteAssetCategorySchema.safeParse(
        await c.req.formData().then((formData) => {
            const data = Object.fromEntries(formData.entries())
            return data
        })
    )

    if (!formData.success) {
        return c.json({ success: false, state: "invalid data" }, 400)
    }

    const { id } = formData.data

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

    const drizzle = getConnection(c.env).drizzle

    if (!id) {
        return c.json({ success: false, state: "no id entered" }, 200)
    }

    // check if assetCategory exists
    const assetCategoryExists = await drizzle.query.assetCategories.findFirst({
        where: (assetCategories, { eq }) => eq(assetCategories.id, id),
    })

    if (!assetCategoryExists) {
        return c.json(
            {
                success: false,
                state: "assetCategory with ID doesn't exist",
            },
            200
        )
    }

    try {
        await drizzle
            .delete(assetCategories)
            .where(eq(assetCategories.id, id))
            .execute()
    } catch (e) {
        return c.json(
            { success: false, state: "failed to delete assetCategory" },
            200
        )
    }

    return c.json({ success: true, state: "deleted assetCategory", id }, 200)
}
