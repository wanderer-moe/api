import { auth } from "@/lib/auth/lucia";
import { Context } from "hono";

export const validate = async (c: Context): Promise<Response> => {
    console.log(c);
    const authRequest = auth(c.env).handleRequest(c);

    // console.log("validate")
    // console.log(authRequest);

    const session = await authRequest.validate();

    if (!session) {
        return c.json({ success: false, state: "invalid session" }, 200);
    }

    if (session.state === "idle") {
        await auth(c.env).invalidateSession(session.sessionId);
        return c.json({ success: false, state: "invalid session" }, 200);
    }

    return c.json({ success: true, state: "valid session", session }, 200);
};
