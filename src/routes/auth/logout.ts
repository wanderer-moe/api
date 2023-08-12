import { auth } from "@/lib/auth/lucia";
import { Context } from "hono";

export const logout = async (c: Context): Promise<Response> => {
    const authRequest = auth(c.env).handleRequest(c);
    const session = await authRequest.validate();

    if (!session) {
        return c.json({ success: false, state: "invalid session" }, 200);
    }

    await auth(c.env).invalidateSession(session.sessionId);
    authRequest.setSession(null);

    return c.json({ success: true, state: "logged out" }, 200);
};
