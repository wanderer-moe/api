import { auth, discordAuth } from "@/v2/lib/auth/lucia"
import { setCookie, getCookie } from "hono/cookie"
import { getConnection } from "@/v2/db/turso"

export async function loginWithDiscord(c: APIContext): Promise<Response> {
    const curr_auth = await auth(c.env)
    const session = auth(c.env).handleRequest(c).validate()

    if (session) {
        c.status(200)
        return c.json({ success: false, state: "already logged in" })
    }

    const discord_auth = await discordAuth(curr_auth, c.env)
    const [url, state] = await discord_auth.getAuthorizationUrl()

    // set state cookie for validation
    setCookie(c, "discord_oauth_state", state, {
        httpOnly: true,
        secure: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "Lax",
    })

    return c.json({ success: true, url, state }, 200)
}

export async function discordCallback(c: APIContext): Promise<Response> {
    const storedState = getCookie(c, "discord_oauth_state")
    const { state, code } = c.req.query()

    // check if state is valid
    if (!storedState || !state || storedState !== state || !code) {
        c.status(400)
        return c.json({ success: false, state: "missing parameters" })
    }

    const curr_auth = await auth(c.env)
    const discord_auth = await discordAuth(curr_auth, c.env)

    const { getExistingUser, discordUser, createUser, createKey } =
        await discord_auth.validateCallback(code)

    const getDiscordUser = async () => {
        const existingUser = await getExistingUser()
        if (existingUser) {
            c.status(200)
            return existingUser
        }

        // check if discord user exists && they have a verified email
        if (
            !discordUser ||
            discordUser.bot ||
            !discordUser.email ||
            !discordUser.verified
        ) {
            throw new Error(
                "discord user doesn't exist or doesn't have a valid email"
            )
        }

        const drizzle = getConnection(c.env).drizzle

        // TODO: users can set discord ID manually, as they may have a different email, etc.
        const userWithEmail = await drizzle.query.users.findFirst({
            where: (users, { eq }) => eq(users.email, discordUser.email),
        })

        // if user exists, create a key for them and update their email_verified attribute
        if (userWithEmail) {
            // @ts-expect-error, this is valid and i don't feel like doing wizardry to make it work
            const user = curr_auth.transformDatabaseUser(userWithEmail)
            await createKey(user.userId)
            await curr_auth.updateUserAttributes(user.userId, {
                email_verified: 1,
            })
            return user
        }

        // if user doesn't exist, create it based off their discord info
        return createUser({
            attributes: {
                username: discordUser.username,
                email: discordUser.email,
                email_verified: 1,
                date_joined: Date.now(),
                verified: 0,
                role_flags: 1,
                is_contributor: 0,
                self_assignable_role_flags: null,
                username_colour: null,
                avatar_url: null,
                banner_url: null,
                pronouns: null,
                bio: "No bio set",
            },
        })
    }

    const user = await getDiscordUser()

    const session = await curr_auth.createSession({
        userId: user.userId,
        attributes: {
            country_code: c.req.header("cf-ipcountry") ?? "",
            user_agent: c.req.header("user-agent") ?? "",
            ip_address: c.req.header("cf-connecting-ip") ?? "",
        },
    })

    return c.json({ success: true, state: "logged in", session }, 200)
}
