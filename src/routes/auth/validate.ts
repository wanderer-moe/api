import { auth, authorizationTokenNames } from "@/lib/auth/lucia";
import { Context } from "hono";
import { deleteCookie } from "hono/cookie";

export const validate = async (c: Context): Promise<Response> => {
    const authRequest = auth.handleRequest(c.req.raw);

    const session = await authRequest.validate();

    if (!session) {
        deleteCookie(c, authorizationTokenNames.session);
    }

    if (session.state === "idle") {
        await auth.invalidateSession(session.sessionId);

        deleteCookie(c, authorizationTokenNames.session);
        return c.redirect("/login");
    }

    return c.json(session, 200);
};
