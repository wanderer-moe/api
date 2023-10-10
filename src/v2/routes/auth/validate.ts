import { auth } from "@/v2/lib/auth/lucia"

export async function validate(c: APIContext): Promise<Response> {
    console.log(c)
    const authRequest = auth(c.env).handleRequest(c)

    const session = await authRequest.validate()

    const countryCode = c.req.header("cf-ipcountry") ?? ""
    const userAgent = c.req.header("user-agent") ?? ""
    const ipAddress = c.req.header("cf-connecting-ip") ?? ""

    if (!session) {
        authRequest.setSession(null)
        return c.json({ success: false, state: "invalid session" }, 401)
    }

    if (
        session.userAgent !== userAgent ||
        session.countryCode !== countryCode ||
        session.ipAddress !== ipAddress ||
        session.state === "idle"
    ) {
        await auth(c.env).invalidateSession(session.sessionId)
        authRequest.setSession(null)
        return c.json({ success: false, state: "invalid session" }, 401)
    }

    return c.json({ success: true, state: "valid session", session }, 200)
}
