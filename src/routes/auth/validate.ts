import { auth } from "@/lib/auth/lucia"
import type { APIContext as Context } from "@/worker-configuration"

export async function validate(c: Context): Promise<Response> {
    console.log(c)
    const authRequest = auth(c.env).handleRequest(c)

    const session = await authRequest.validate()

    const countryCode = c.req.headers.get("cf-ipcountry") ?? ""
    const userAgent = c.req.headers.get("user-agent") ?? ""

    if (!session) {
        authRequest.setSession(null)
        return c.json({ success: false, state: "invalid session" }, 200)
    }

    if (
        session.userAgent !== userAgent ||
        session.countryCode !== countryCode
    ) {
        await auth(c.env).invalidateSession(session.sessionId)
        authRequest.setSession(null)
        return c.json({ success: false, state: "invalid session" }, 200)
    }

    if (session.state === "idle") {
        await auth(c.env).invalidateSession(session.sessionId)
        authRequest.setSession(null)
        return c.json({ success: false, state: "invalid session" }, 200)
    }

    return c.json({ success: true, state: "valid session", session }, 200)
}
