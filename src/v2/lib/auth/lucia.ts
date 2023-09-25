import { lucia } from "lucia"
import { hono } from "lucia/middleware"
import { getConnection } from "@/v2/db/turso"
import { tableNames } from "@/v2/db/drizzle"
import { unstorage } from "@lucia-auth/adapter-session-unstorage"
import { libsql } from "@lucia-auth/adapter-sqlite"
import { createStorage } from "unstorage"
import cloudflareKVBindingDriver from "unstorage/drivers/cloudflare-kv-binding"
import { discord } from "@lucia-auth/oauth/providers"

/**
 * Creates a KV session storage using the Cloudflare KV binding driver.
 * @param {Bindings} env - Hono environment bindings.
 * @returns The KV session storage.
 * @see https://unstorage.unjs.io/drivers/cloudflare-kv-binding
 */
export function KVSessionStorage(env: Bindings) {
    return createStorage({
        driver: cloudflareKVBindingDriver({
            binding: env.kv,
        }),
    })
}

/** The `auth` function is used to create a `lucia` instance with authentication middleware and a `libsql` adapter.
 * @param {Bindings} env - The environment variables used to configure the authentication middleware and adapter.
 * @returns A `lucia` instance with authentication middleware and a `libsql` adapter.
 */
export function auth(env: Bindings) {
    const db = getConnection(env)

    const storage = KVSessionStorage(env)
    // as lucia doesn't have a adapter for drizzle, we instead create a direct connection to the database using libsql
    const connection = db.turso

    return lucia({
        adapter: {
            user: libsql(connection, {
                user: tableNames.authUser,
                key: tableNames.authKey,
                session: null, // we are handling sessions w/ CF KV
            }),
            session: unstorage(storage),
        },
        middleware: hono(),
        sessionExpiresIn: {
            idlePeriod: 0,
            activePeriod: 30 * 24 * 60 * 60 * 1000, // 30 days
        },
        env: env.ENVIRONMENT === "DEV" ? "DEV" : "PROD",
        experimental: {
            debugMode: env.ENVIRONMENT === "DEV" ? true : false,
        },
        csrfProtection: {
            enabled: true,
            allowedSubDomains: ["*"],
        },
        getUserAttributes: (user) => {
            return {
                avatarUrl: user.avatar_url,
                bannerUrl: user.banner_url,
                username: user.username,
                usernameColour: user.username_colour,
                email: user.email,
                emailVerified: user.email_verified,
                pronouns: user.pronouns,
                verified: user.verified,
                bio: user.bio,
                dateJoined: user.date_joined,
                roleFlags: user.role_flags,
                isContributor: user.is_contributor,
                selfAssignableRoleFlags: user.self_assignable_role_flags,
            }
        },
        getSessionAttributes: (session) => {
            return {
                userAgent: session.user_agent,
                countryCode: session.country_code,
                ipAddress: session.ip_address,
            }
        },
    })
}

export type Auth = ReturnType<typeof auth>

/**
 * The `discordAuth` function is used to create a `discord` object for use with the `auth` function.
 * @param {Auth} auth - Auth instance used by Lucia.
 * @param {Bindings} env - Hono environment bindings.
 * @returns - Discord Object.
 */
export function discordAuth(auth: Auth, env: Bindings) {
    return discord(auth, {
        clientId: env.DISCORD_CLIENT_ID,
        clientSecret: env.DISCORD_CLIENT_SECRET,
        redirectUri: env.DISCORD_REDIRECT_URI,
        scope: ["identify", "email"],
    })
}
