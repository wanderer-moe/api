import { auth } from "@/lib/auth/lucia";
import { Context } from "hono";
// import * as validate from "@/lib/regex/accountValidation";

export const signup = async (c: Context) => {
    const formData = await c.req.formData();

    const secretKeyRequiredForSignup = c.env.VERY_SECRET_SIGNUP_KEY;

    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const passwordConfirm = formData.get("passwordConfirm") as string;
    const secretKey = formData.get("secretKey") as string;
    // console.log(username, email, password, passwordConfirm);

    const validSession = await auth(c.env).handleRequest(c).validate();
    if (validSession)
        return c.json({ success: false, state: "already logged in" }, 200);

    if (
        secretKeyRequiredForSignup !== secretKey ||
        passwordConfirm !== password
    ) {
        return c.json(
            {
                success: false,
                status: "error",
                error: "Invalid credentials",
            },
            400
        );
    }

    console.log("creating user");

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
                role_flags: 1,
                self_assignable_role_flags: null,
                username_colour: null,
                avatar_url: null,
                banner_url: null,
                pronouns: null,
                bio: null,
            },
        });

        const userAgentHash = await crypto.subtle.digest(
            { name: "MD5" },
            new TextEncoder().encode(c.req.headers.get("user-agent") ?? "")
        );
        const countryCode = c.req.headers.get("cf-ipcountry") ?? "";

        const newSession = await auth(c.env).createSession({
            userId: user.userId,
            attributes: {
                country_code: countryCode,
                user_agent_hash: userAgentHash,
            },
        });

        const authRequest = auth(c.env).handleRequest(c);
        authRequest.setSession(newSession);
        return c.json({ success: true, state: "logged in" }, 200);
    } catch (e) {
        console.log(e);
        return c.json(
            {
                success: false,
                status: "error",
                error: "Error creating user",
            },
            500
        );
    }
};
