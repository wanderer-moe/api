import { auth } from "@/lib/auth/lucia";
import type { RegisterBody } from "@/lib/types/auth";
// import { Hono } from "hono";
// import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { responseHeaders } from "@/lib/responseHeaders";

export const signup = async (request: Request): Promise<Response> => {
    const body = (await request.json()) as RegisterBody;
    const { username, password, email, passwordConfirm } = body;

    // TODO: in-depth error handling

    if (!username || !password || !email || !passwordConfirm) {
        return new Response(
            JSON.stringify({
                success: false,
                status: "error",
                error: "400 Bad Request",
            }),
            {
                status: 400,
                headers: responseHeaders,
            }
        );
    }

    const user = await auth.createUser({
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

    const newSession = await auth.createSession({
        userId: user.userId,
        attributes: {},
    });

    const sessionCookie = auth.createSessionCookie(newSession);

    return new Response(null, {
        headers: {
            Location: "/",
            "Set-Cookie": sessionCookie.serialize(),
        },
        status: 302,
    });
};
