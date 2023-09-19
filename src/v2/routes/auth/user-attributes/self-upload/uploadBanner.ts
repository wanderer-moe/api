import { auth } from "@/v2/lib/auth/lucia"

// TODO: add support for animated banners
export async function uploadBannerImage(c: APIContext): Promise<Response> {
    const authRequest = auth(c.env).handleRequest(c)
    const session = await authRequest.validate()

    if (!session || session.state === "idle" || session.state === "invalid") {
        if (session) {
            await auth(c.env).invalidateSession(session.sessionId)
            authRequest.setSession(null)
        }
        return c.json({ success: false, state: "invalid session" }, 200)
    }

    if (session.user.is_contributor !== 1) {
        return c.json({ success: false, state: "unauthorized" }, 401)
    }

    const formData = await c.req.formData()

    const banner = formData.get("banner") as unknown as File | null

    if (!banner || banner.type !== "image/png") {
        return c.json({ success: false, state: "invalid banner" }, 200)
    }

    const newBanner = new File([banner], `${session.userId}.png`)
    const newBannerURL = `/banners/${session.userId}.png`

    if (!session.user.banner_url) {
        await auth(c.env).updateUserAttributes(session.userId, {
            banner_url: newBannerURL,
        })
    }

    if (session.user.banner_url) {
        const oldBannerObject = await c.env.bucket.get(session.user.banner_url)

        if (oldBannerObject) {
            await c.env.bucket.delete(session.user.banner_url)
        }
    }

    await c.env.bucket.put(newBannerURL, newBanner)

    return c.json({ success: true, state: "uploaded new banner" }, 200)
}
