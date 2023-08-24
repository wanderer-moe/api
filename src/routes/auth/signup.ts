import { auth } from "@/lib/auth/lucia"
// import * as validate from "@/lib/regex/accountValidation";

export const signup = async (c) => {
    const formData = await c.req.formData()

    const secretKeyRequiredForSignup = c.env.VERY_SECRET_SIGNUP_KEY

    const username = formData.get("username") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const passwordConfirm = formData.get("passwordConfirm") as string
    const secretKey = formData.get("secretKey") as string

    const validSession = await auth(c.env).handleRequest(c).validate()
    if (validSession)
        return c.json({ success: false, state: "already logged in" }, 200)

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
        )
    }

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
                pronouns: null, // we can splice this into possesive, subject, and object pronouns by "/"
                bio: "No bio set",
            },
        })

        const userAgent = c.req.headers.get("user-agent") ?? ""
        const countryCode = c.req.headers.get("cf-ipcountry") ?? ""

        const newSession = await auth(c.env).createSession({
            userId: user.userId,
            attributes: {
                country_code: countryCode,
                user_agent: userAgent,
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
