import { auth } from "@/v2/lib/auth/lucia"
import type { APIContext as Context } from "@/worker-configuration"

export async function logout(c: Context): Promise<Response> {
	const authRequest = auth(c.env).handleRequest(c)
	const session = await authRequest.validate()

	if (!session) {
		c.status(401)
		return c.json({ success: false, state: "invalid session" })
	}

	// this is useful to clean up dead sessions that are still in the database
	await auth(c.env).deleteDeadUserSessions(session.userId)
	await auth(c.env).invalidateSession(session.sessionId)
	authRequest.setSession(null)

	c.status(200)
	return c.json({ success: true, state: "logged out" })
}
