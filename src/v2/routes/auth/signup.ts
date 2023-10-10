import { auth } from "@/v2/lib/auth/lucia"

export async function signup(c: APIContext): Promise<Response> {
    const formData = await c.req.formData()

    const username = formData.get("username") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const validSession = await auth(c.env).handleRequest(c).validate()
    if (validSession)
        return c.json({ success: false, state: "already logged in" }, 200)

    console.log("creating user")

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
                date_joined: Date.now(),
                verified: 0,
                role_flags: 1,
                is_contributor: 0,
                self_assignable_role_flags: null,
                username_colour: null,
                avatar_url: null,
                banner_url: null,
                pronouns: null, // we can splice this into possesive, subject, and object pronouns by "/", e.g "he/him/his" => {subject: "he", object: "him", possesive: "his"}
                bio: "No bio set",
            },
        })

        const userAgent = c.req.header("user-agent") ?? ""
        const countryCode = c.req.header("cf-ipcountry") ?? ""
        const ipAddress = c.req.header("cf-connecting-ip") ?? ""

        // TODO: encrypt session attributes with sha256
        const newSession = await auth(c.env).createSession({
            userId: user.userId,
            attributes: {
                country_code: countryCode,
                user_agent: userAgent,
                ip_address: ipAddress,
            },
        })

        const authRequest = auth(c.env).handleRequest(c)
        authRequest.setSession(newSession)
        return c.json({ success: true, state: "logged in" }, 200)
    } catch (e) {
        console.log(e)
        return c.json(
            {
                success: false,
                status: "error",
                error: "Error creating user",
            },
            500
        )
    }
}
