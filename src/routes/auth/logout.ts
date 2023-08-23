import { auth } from "@/lib/auth/lucia";

export const logout = async (c): Promise<Response> => {
    const authRequest = auth(c.env).handleRequest(c);
    const session = await authRequest.validate();

    if (!session) {
        return c.json({ success: false, state: "invalid session" }, 200);
    }

    // this is useful to clean up dead sessions that are still in the database
    await auth(c.env).deleteDeadUserSessions(session.userId);
    await auth(c.env).invalidateSession(session.sessionId);
    authRequest.setSession(null);

    return c.json({ success: true, state: "logged out" }, 200);
};
