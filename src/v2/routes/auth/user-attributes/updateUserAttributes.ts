import { auth } from "@/v2/lib/auth/lucia"

type UserAttributes = {
    username?: string
    pronouns?: string
    self_assignable_role_flags?: number
    bio?: string
}

export async function updateUserAttributes(c: APIContext): Promise<Response> {
    const authRequest = auth(c.env).handleRequest(c)
    const session = await authRequest.validate()

    if (!session || session.state === "idle") {
        if (session) {
            await auth(c.env).invalidateSession(session.sessionId)
            authRequest.setSession(null)
        }
        return c.json({ success: false, state: "unauthorized" }, 401)
    }

    const formData = (await c.req.formData()) as FormData

    const attributes: UserAttributes = {
        username: formData.get("username"),
        pronouns: formData.get("pronouns"),
        self_assignable_role_flags: Number(
            formData.get("self_assignable_roles")
        ),
        bio: formData.get("bio"),
    }

    const attributesWithoutNull = Object.fromEntries(
        Object.entries(attributes).filter(([, value]) => value !== null)
    )

    try {
        await auth(c.env).updateUserAttributes(
            session.user.userId,
            attributesWithoutNull
        )
        return c.json(
            { success: true, state: "updated user attributes", session },
            200
        )
    } catch (error) {
        return c.json(
            { success: false, state: "error updating user attributes" },
            500
        )
    }
}
