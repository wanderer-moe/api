import { auth, discordAuth } from "@/v2/lib/auth/lucia"
import { setCookie } from "hono/cookie"

export async function loginWithDiscord(c: APIContext): Promise<Response> {
    const curr_auth = await auth(c.env)
    const session = auth(c.env).handleRequest(c).validate()

    if (session) {
        c.status(200)
        return c.json({ success: false, state: "already logged in" })
    }

    const discord_auth = await discordAuth(curr_auth, c.env)
    const [url, state] = await discord_auth.getAuthorizationUrl()

    setCookie(c, "discord_oauth_state", state, {
        httpOnly: true,
        secure: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "Lax",
    })

    return c.json({ success: true, url, state }, 200)
}
