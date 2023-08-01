import { auth } from "@/lib/auth/lucia";
import type { RegisterBody } from "@/lib/types/auth";
import { responseHeaders } from "@/lib/responseHeaders";

export const login = async (request: Request): Promise<Response> => {
    const body = (await request.json()) as RegisterBody;
    const { username, password, email, passwordConfirm } = body;

    if (!username || !password || !email || !passwordConfirm) {
        return new Response(
            JSON.stringify({
                success: false,
                status: "error",
                error: "400 Bad Request",
            }),
            {
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
            role: "USER",
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
