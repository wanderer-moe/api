import { auth } from "@/lib/auth/lucia";

export const updateUserAttributes = async (c) => {
    const authRequest = auth(c.env).handleRequest(c);
    const session = await authRequest.validate();

    if (!session) {
        authRequest.setSession(null);
        return c.json({ success: false, state: "invalid session" }, 200);
    }

    const formData = await c.req.formData();

    const attributes = {
        username: formData.get("username") as string | null,
        username_colour: formData.get("username_colour") as string | null,
        pronouns: formData.get("pronouns") as string | null,
        bio: formData.get("bio") as string | null,
    };

    // remove null values from attributes
    Object.keys(attributes).forEach((key) => {
        if (attributes[key] === null) delete attributes[key];
    });

    await auth(c.env).updateUserAttributes(session.userId, attributes);

    return c.json(
        { success: true, state: "updated user attributes", session },
        200
    );
};
