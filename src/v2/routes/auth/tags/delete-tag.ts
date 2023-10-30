import { auth } from "@/v2/lib/auth/lucia"
import { roleFlagsToArray } from "@/v2/lib/helpers/role-flags"
import { getConnection } from "@/v2/db/turso"
import { z } from "zod"
import { assetTag } from "@/v2/db/schema"
import { eq } from "drizzle-orm"

const DeleteTagSchema = z.object({
    id: z.string({
        required_error: "ID is required",
        invalid_type_error: "ID must be a string",
    }),
})

export async function deleteTag(c: APIContext): Promise<Response> {
    const formData = DeleteTagSchema.safeParse(
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
        return c.json({ success: false, state: "invalid session" }, 200)
    }

    const roleFlags = roleFlagsToArray(session.user.roleFlags)

    if (!roleFlags.includes("CREATOR")) {
        return c.json({ success: false, state: "unauthorized" }, 401)
    }

    const { drizzle } = getConnection(c.env)

    try {
        await drizzle.delete(assetTag).where(eq(assetTag.id, id)).execute()
    } catch (e) {
        return c.json({ success: false, state: "failed to delete tag" }, 200)
    }

    return c.json({ success: true, state: "deleted tag", id }, 200)
}
