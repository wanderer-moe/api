import { auth, authorizationTokenNames } from "@/lib/auth/lucia";
import { Context } from "hono";
import { setCookie } from "hono/cookie";
import * as validate from "@/lib/regex/accountValidation";
import { LuciaError } from "lucia";

export const signup = async (c: Context) => {
    const body = await c.req.formData();

    const username = body.get("username") as string;
    const password = body.get("password") as string;
    const passwordConfirm = body.get("passwordConfirm") as string;
    const email = body.get("email") as string;

    const validSession = await auth(c.env).handleRequest(c.req.raw).validate();

    if (validSession)
        return c.json({ success: false, state: "already logged in" }, 200);

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

    try {
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

        return c.json({ success: true, state: "logged in" }, 200);
    } catch (e) {
        if (e instanceof LuciaError) {
            return c.json(
                {
                    success: false,
                    status: "error",
                    error: "Account creation error, most likely already exists",
                },
                500
            );
        }
        return c.json(
            {
                success: false,
                status: "error",
                error: "500 Internal Server Error",
            },
            500
        );
    }
};
