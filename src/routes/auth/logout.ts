import { auth } from "@/lib/auth/lucia";
import { Context } from "hono";
import { deleteCookie } from "hono/cookie";
import { authorizationTokenNames } from "@/lib/auth/lucia";

export const logout = async (c: Context): Promise<Response> => {
    const authRequest = auth(c.env).handleRequest(c.req.raw);
    const session = await authRequest.validate();

    if (!session) {
        return c.redirect("/login");
    }

    deleteCookie(c, authorizationTokenNames.session);
    await auth(c.env).invalidateSession(session.sessionId);
    return c.redirect("/login");
};
