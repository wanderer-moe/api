import { auth, authorizationTokenNames } from "@/lib/auth/lucia";
import type { RegisterBody } from "@/lib/types/auth";
import { Context } from "hono";
import { setCookie } from "hono/cookie";
import * as validate from "@/lib/regex/accountValidation";

export const signup = async (c: Context) => {
    const body = (await c.req.json()) as RegisterBody;

    const { username, password, email, passwordConfirm } = body;
    const validSession = await auth(c.env).handleRequest(c.req.raw).validate();

    if (validSession) return c.redirect("/");

    if (
        !validate.username(username) ||
        !validate.password(password) ||
        !validate.email(email) ||
        password !== passwordConfirm
    ) {
        return c.json(
            {
                success: false,
                status: "error",
                error: "400 Bad Request",
            },
            400
        );
    }

    const user = await auth(c.env).createUser({
        key: {
            providerId: "username",
            providerUserId: username.toLowerCase(),
            password,
        },
        attributes: {
            username,
            email,
            email_verified: 0,
            date_joined: new Date(),
            verified: 0,
            role_flags: 0,
            self_assignable_role_flags: null,
            username_colour: null,
            avatar_url: null,
            banner_url: null,
            pronouns: null,
            bio: null,
        },
    });

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

    return c.redirect("/");
};
