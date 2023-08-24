import { auth } from "@/lib/auth/lucia"

export const uploadProfileImage = async (c): Promise<Response> => {
    const authRequest = auth(c.env).handleRequest(c)
    const session = await authRequest.validate()

    if (!session || session.state === "idle" || session.state === "invalid") {
        if (session) {
            await auth(c.env).invalidateSession(session.sessionId)
            authRequest.setSession(null)
        }
        return c.json({ success: false, state: "invalid session" }, 200)
    }

    const formData = await c.req.formData()

    const avatar = formData.get("avatar") as File | null

    const newAvatar = new File([avatar], `${session.userId}.png`)
    const newAvatarURL = `/avatars/${session.userId}.png`

    if (!session.user.avatar_url) {
        await auth(c.env).updateUserAttributes(session.userId, {
            avatar_url: newAvatarURL,
        })
    }

    await c.env.bucket.put(newAvatarURL, newAvatar, {
        contentType: "image/png",
    })

    return c.json({ success: true, state: "uploaded new profile image" }, 200)
}