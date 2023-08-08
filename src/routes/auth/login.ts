import { auth } from "@/lib/auth/lucia";
import { Context } from "hono";
import * as validate from "@/lib/regex/accountValidation";

export const login = async (c: Context): Promise<Response> => {
    const formData = await c.req.formData();

    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    // console.log(username, password);

    const validSession = await auth(c.env).handleRequest(c).validate();

    if (validSession)
        return c.json({ success: false, state: "already logged in" }, 200);

    if (!validate.username(username) || !validate.password(password)) {
        return c.json(
            {
                success: false,
                status: "error",
                error: "Invalid credentials",
            },
            400
        );
    }

    const user = await auth(c.env).useKey(
        "username",
        username.toLowerCase(),
        password
    );

    if (!user) {
        return c.json(
            {
                success: false,
                status: "error",
                error: "Invalid credentials",
            },
            400
        );
    }

    const newSession = await auth(c.env).createSession({
        userId: user.userId,
        attributes: {},
    });

    const authRequest = await auth(c.env).handleRequest(c);
    authRequest.setSession(newSession);

    return c.json({ success: true, state: "logged in" }, 200);
};
