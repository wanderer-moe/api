import { auth, authorizationTokenNames } from "@/lib/auth/lucia";
import { Context } from "hono";
import { getCookie, deleteCookie } from "hono/cookie";

export const validate = async (c: Context): Promise<Response> => {
    const authRequest = auth(c.env).handleRequest(c.req.raw);

    const session = await authRequest.validate();

    if (!session) {
        // get the cookie, if it exists, and delete it
        const cookie = getCookie(c, authorizationTokenNames.session);
        if (cookie) {
            deleteCookie(c, authorizationTokenNames.session);
        }
        return c.json({ success: true, state: "invalid session" }, 200);
    }

    if (session.state === "idle") {
        await auth(c.env).invalidateSession(session.sessionId);

        deleteCookie(c, authorizationTokenNames.session);
        return c.json({ success: true, state: "invalid session" }, 200);
    }

    return c.json(session, 200);
};
