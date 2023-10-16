import { auth } from "@/v2/lib/auth/lucia"
import { z } from "zod"

const ALLOWED_BANNER_TYPES = ["image/png"]
const MAX_AVATAR_SIZE = 5000

const UploadProfileImageSchema = z.object({
    avatar: z
        .any()
        .refine((files) => files?.length == 1, "Avatar is required.")
        .refine(
            (files) => files?.[0]?.size <= MAX_AVATAR_SIZE,
            `Max file size is 5MB.`
        )
        .refine(
            (files) => ALLOWED_BANNER_TYPES.includes(files?.[0]?.type),
            ".png files are accepted."
        ),
})

// TODO: add support for animated avatars
export async function uploadProfileImage(c: APIContext): Promise<Response> {
    const formData = UploadProfileImageSchema.safeParse(
        await c.req.formData().then((formData) => {
            const data = Object.fromEntries(formData.entries())
            return data
        })
    )

    if (!formData.success) {
        return c.json({ success: false, state: "invalid data" }, 400)
    }

    const { avatar } = formData.data

    const authRequest = auth(c.env).handleRequest(c)
    const session = await authRequest.validate()

    if (!session || session.state === "idle") {
        if (session) {
            await auth(c.env).invalidateSession(session.sessionId)
            authRequest.setSession(null)
        }
        return c.json({ success: false, state: "invalid session" }, 200)
    }

    const newAvatar = new File([avatar], `${session.user.userId}.png`)
    const newAvatarURL = `/avatars/${session.user.userId}.png`

    if (!session.user.avatarUrl) {
        await auth(c.env).updateUserAttributes(session.user.userId, {
            avatar_url: newAvatarURL,
        })
    }

    if (session.user.avatarUrl) {
        const oldAvatarObject = await c.env.FILES_BUCKET.get(
            session.user.avatarUrl
        )

        if (oldAvatarObject) {
            await c.env.FILES_BUCKET.delete(session.user.avatarUrl)
        }
    }

    await c.env.FILES_BUCKET.put(newAvatarURL, newAvatar)

    return c.json({ success: true, state: "uploaded new profile image" }, 200)
}
