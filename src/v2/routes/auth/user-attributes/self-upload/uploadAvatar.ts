import { auth } from "@/v2/lib/auth/lucia"

// TODO: add support for animated avatars
export async function uploadProfileImage(c: APIContext): Promise<Response> {
    const authRequest = auth(c.env).handleRequest(c)
    const session = await authRequest.validate()

    if (!session || session.state === "idle") {
        if (session) {
            await auth(c.env).invalidateSession(session.sessionId)
            authRequest.setSession(null)
        }
        return c.json({ success: false, state: "invalid session" }, 200)
    }

    const formData = await c.req.formData()

    const avatar = formData.get("avatar") as unknown as File | null

    if (!avatar || avatar.type !== "image/png") {
        return c.json({ success: false, state: "invalid avatar" }, 200)
    }

    const newAvatar = new File([avatar], `${session.user.userId}.png`)
    const newAvatarURL = `/avatars/${session.user.userId}.png`

    if (!session.user.avatarUrl) {
        await auth(c.env).updateUserAttributes(session.user.userId, {
            avatar_url: newAvatarURL,
        })
    }

    if (session.user.avatarUrl) {
        const oldAvatarObject = await c.env.bucket.get(session.user.avatarUrl)

        if (oldAvatarObject) {
            await c.env.bucket.delete(session.user.avatarUrl)
        }
    }

    await c.env.bucket.put(newAvatarURL, newAvatar)

    return c.json({ success: true, state: "uploaded new profile image" }, 200)
}
