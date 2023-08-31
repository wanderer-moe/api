import { auth } from "@/lib/auth/lucia"
import type { APIContext as Context } from "@/worker-configuration"

export async function updateUserAttributes(c: Context): Promise<Response> {
    const authRequest = auth(c.env).handleRequest(c)
    const session = await authRequest.validate()

    if (!session) {
        authRequest.setSession(null)
        return c.json({ success: false, state: "invalid session" }, 200)
    }

    const formData = await c.req.formData()

    const attributes = {
        username: formData.get("username") as string | null,
        pronouns: formData.get("pronouns") as string | null,
        self_assignable_role_flags: formData.get(
            "self_assignable_roles"
        ) as unknown as number | null,
        bio: formData.get("bio") as string | null,
    }

    // remove null values from attributes
    Object.keys(attributes).forEach((key) => {
        if (attributes[key] === null) delete attributes[key]
    })

    await auth(c.env).updateUserAttributes(session.userId, attributes)

    return c.json(
        { success: true, state: "updated user attributes", session },
        200
    )
}
