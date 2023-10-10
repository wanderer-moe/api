import { auth } from "@/v2/lib/auth/lucia"

export async function logout(c: APIContext): Promise<Response> {
    const authRequest = auth(c.env).handleRequest(c)
    const session = await authRequest.validate()

    if (!session) {
        return c.json({ success: false, state: "invalid session" }, 401)
    }

    // this is useful to clean up dead sessions that are still in the database
    await auth(c.env).deleteDeadUserSessions(session.user.userId)
    await auth(c.env).invalidateSession(session.sessionId)
    authRequest.setSession(null)

    return c.json({ success: true, state: "logged out" }, 200)
}
