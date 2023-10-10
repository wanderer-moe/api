import {
    auth as authAdapter,
    discordAuth as discordAuthAdapter,
} from "@/v2/lib/auth/lucia"
import { setCookie, getCookie } from "hono/cookie"
import { getConnection } from "@/v2/db/turso"
import { socialsConnections } from "@/v2/db/schema"

export async function loginWithDiscord(c: APIContext): Promise<Response> {
    const auth = await authAdapter(c.env)
    const session = authAdapter(c.env).handleRequest(c).validate()

    if (session) {
        c.status(200)
        return c.json({ success: false, state: "already logged in" })
    }

    const discordAuth = await discordAuthAdapter(auth, c.env)
    const [url, state] = await discordAuth.getAuthorizationUrl()

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

    const auth = await authAdapter(c.env)
    const discordAuth = await discordAuthAdapter(auth, c.env)

    const { getExistingUser, discordUser, createUser, createKey } =
        await discordAuth.validateCallback(code)

    const getDiscordUser = async () => {
        const existingUser = await getExistingUser()
        if (existingUser) {
            c.status(200)
            return existingUser
        }

        // check if discord user exists && they have a verified email
        if (!discordUser || discordUser.bot) {
            throw new Error("discord user is invalid email")
        }

        if (!discordUser.email || !discordUser.verified) {
            throw new Error("discord user doesnt have a verified email")
        }

        const drizzle = getConnection(c.env).drizzle

        const userWithEmail = await drizzle.query.users.findFirst({
            where: (users, { eq }) => eq(users.email, discordUser.email),
        })

        // if user exists, we create a discord key for them and update their email_verified attribute
        if (userWithEmail) {
            // check if user with same email has a discord id set as a social connection
            const getUsersConnections =
                await drizzle.query.socialsConnections.findFirst({
                    where: (socialsConnections, { eq }) =>
                        eq(socialsConnections.userId, userWithEmail.id),
                })

            if (
                getUsersConnections &&
                getUsersConnections.discordId !== discordUser.id
            ) {
                throw new Error(
                    "user with same email has a different discord id set as a social connection"
                )
            }

            const user = await auth.getUser(userWithEmail.id)

            await createKey(user.userId)
            if (user.emailVerified !== 1) {
                await auth.updateUserAttributes(user.userId, {
                    email_verified: 1,
                })
            }

            return user
        }

        // if user doesn't exist, create it based off their discord info
        const createdUser = await createUser({
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

        // add discord id as a social connection
        await drizzle
            .insert(socialsConnections)
            .values({
                id: `${createdUser.userId}`,
                userId: createdUser.userId,
                discordId: discordUser.id,
            })
            .execute()

        return createdUser
    }

    const user = await getDiscordUser()

    const session = await auth.createSession({
        userId: user.userId,
        attributes: {
            country_code: c.req.header("cf-ipcountry") ?? "",
            user_agent: c.req.header("user-agent") ?? "",
            ip_address: c.req.header("cf-connecting-ip") ?? "",
        },
    })

    return c.json({ success: true, state: "logged in", session }, 200)
}
