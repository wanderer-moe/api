import { auth, authorizationTokenNames } from "@/lib/auth/lucia";
import type { LoginBody } from "@/lib/types/auth";
import { Context } from "hono";
import { setCookie } from "hono/cookie";
import * as validate from "@/lib/regex/accountValidation";

export const login = async (c: Context): Promise<Response> => {
    const body = (await c.req.json()) as LoginBody;
    const { username, password } = body;

    const validSession = await auth(c.env).handleRequest(c.req.raw).validate();

    if (validSession) {
        return c.json({ success: false, state: "already logged in" }, 200);
    }

    if (!validate.username(username) || !validate.password(password)) {
        return c.json(
            {
                success: false,
                status: "error",
                error: "400 Bad Request",
            },
            400
        );
    }

    const user = await auth(c.env).useKey(
        "username",
        username.toLowerCase(),
        password
    );

    const newSession = await auth(c.env).createSession({
        userId: user.userId,
        attributes: {},
    });

    setCookie(c, authorizationTokenNames.csrf, newSession.sessionId, {
        expires: newSession.activePeriodExpiresAt,
        httpOnly: true,
        secure: true,
        sameSite: "Lax",
    });

    return c.json({ success: true, state: "logged in" }, 200);
};
