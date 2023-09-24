import { lucia } from "lucia"
import { hono } from "lucia/middleware"
import { getConnection } from "@/v2/db/turso"
import { tableNames } from "@/v2/db/drizzle"
import { libsql } from "@lucia-auth/adapter-sqlite"

/**
 * The `auth` function is used to create a `lucia` instance with authentication middleware and a `libsql` adapter.
 * @param env - The environment variables used to configure the authentication middleware and adapter.
 * @returns A `lucia` instance with authentication middleware and a `libsql` adapter.
 */
export const auth = (env: Bindings) => {
    const db = getConnection(env)

    // as lucia doesn't have a adapter for drizzle, we instead create a direct connection to the database using libsql
    const connection = db.turso

    return lucia({
        adapter: libsql(connection, {
            key: tableNames.authKey,
            session: tableNames.authSession,
            user: tableNames.authUser,
        }),
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
                username: user.username,
                usernameColour: user.username_colour,
                avatarUrl: user.avatar_url,
                bannerUrl: user.banner_url,
                email: user.email,
                emailVerified: user.email_verified,
                pronouns: user.pronouns,
                verified: user.verified,
                bio: user.bio,
                roleFlags: user.role_flags,
                selfAssignableRoleFlags: user.self_assignable_role_flags,
                dateJoined: user.date_joined,
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

/**
 * The `Auth` type is a type alias for the `auth` function.
 */
export type Auth = typeof auth
