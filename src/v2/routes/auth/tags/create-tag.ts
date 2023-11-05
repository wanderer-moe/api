import { auth } from "@/v2/lib/auth/lucia"
import { roleFlagsToArray } from "@/v2/lib/helpers/role-flags"
import { getConnection } from "@/v2/db/turso"
import { z } from "zod"
import { assetTag } from "@/v2/db/schema"

const CreateTagSchema = z.object({
    name: z.string({
        required_error: "Name is required",
        invalid_type_error: "Name must be a string",
    }),
    formattedName: z.string({
        required_error: "Formatted name is required",
        invalid_type_error: "Formatted name must be a string",
    }),
})

export async function createTag(c: APIContext): Promise<Response> {
    const formData = CreateTagSchema.safeParse(
        await c.req.formData().then((formData) => {
            const data = Object.fromEntries(formData.entries())
            return data
        })
    )

    if (!formData.success) {
        return c.json({ success: false, state: "invalid data" }, 400)
    }

    const { name, formattedName } = formData.data

    const authRequest = auth(c.env).handleRequest(c)
    const session = await authRequest.validate()

    if (!session || session.state === "idle") {
        if (session) {
            await auth(c.env).invalidateSession(session.sessionId)
            authRequest.setSession(null)
        }
        return c.json({ success: false, state: "invalid session" }, 401)
    }

    const roleFlags = roleFlagsToArray(session.user.roleFlags)

    if (!roleFlags.includes("CREATOR")) {
        return c.json({ success: false, state: "unauthorized" }, 401)
    }

    const { drizzle } = getConnection(c.env)

    const tag = {
        id: crypto.randomUUID(),
        name,
        formattedName,
        assetCount: 0,
        lastUpdated: new Date().toISOString(),
    }

    // check if tag.name exists
    const tagExists = await drizzle.query.assetTag.findFirst({
        where: (assetTag, { eq }) => eq(assetTag.name, tag.name),
    })

    if (tagExists) {
        return c.json(
            { success: false, state: "tag with name already exists" },
            200
        )
    }

    try {
        await drizzle.insert(assetTag).values(tag).execute()
    } catch (e) {
        return c.json({ success: false, state: "failed to create tag" }, 200)
    }

    return c.json({ success: true, state: "created tag", tag }, 200)
}
