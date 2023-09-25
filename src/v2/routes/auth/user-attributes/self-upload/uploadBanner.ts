import { auth } from "@/v2/lib/auth/lucia"

// TODO: add support for animated banners
export async function uploadBannerImage(c: APIContext): Promise<Response> {
    const authRequest = auth(c.env).handleRequest(c)
    const session = await authRequest.validate()

    if (!session || session.state === "idle") {
        if (session) {
            await auth(c.env).invalidateSession(session.sessionId)
            authRequest.setSession(null)
        }
        return c.json({ success: false, state: "invalid session" }, 200)
    }

    if (session.user.isContributor !== 1) {
        return c.json({ success: false, state: "unauthorized" }, 401)
    }

    const formData = await c.req.formData()

    const banner = formData.get("banner") as unknown as File | null

    if (!banner || banner.type !== "image/png") {
        return c.json({ success: false, state: "invalid banner" }, 200)
    }

    const newBanner = new File([banner], `${session.user.userId}.png`)
    const newBannerURL = `/banners/${session.user.userId}.png`

    if (!session.user.avatarUrl) {
        await auth(c.env).updateUserAttributes(session.user.userId, {
            banner_url: newBannerURL,
        })
    }

    if (session.user.avatarUrl) {
        const oldBannerObject = await c.env.bucket.get(session.user.bannerUrl)

        if (oldBannerObject) {
            await c.env.bucket.delete(session.user.avatarUrl)
        }
    }

    await c.env.bucket.put(newBannerURL, newBanner)

    return c.json({ success: true, state: "uploaded new banner" }, 200)
}
