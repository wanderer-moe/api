import { auth } from "@/lib/auth/lucia"
import type { Context } from "hono"

// TODO: add support for animated avatars
export async function uploadProfileImage(c: Context): Promise<Response> {
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

    const avatar = formData.get("avatar") as unknown as File | null

    if (!avatar || avatar.type !== "image/png") {
        return c.json({ success: false, state: "invalid avatar" }, 200)
    }

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
