import { auth } from "@/lib/auth/lucia";
import type { LoginBody } from "@/lib/types/auth";
import { responseHeaders } from "@/lib/responseHeaders";

export const login = async (request: Request): Promise<Response> => {
    const body = (await request.json()) as LoginBody;
    const { username, password } = body;

    if (!username || !password) {
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

    const user = await auth.useKey(
        "username",
        username.toLowerCase(),
        password
    );

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
