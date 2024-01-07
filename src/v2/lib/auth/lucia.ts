import { Lucia } from "lucia"
import { getConnection } from "@/v2/db/turso"
import { tableNames } from "@/v2/db/drizzle"
import { LibSQLAdapter } from "@lucia-auth/adapter-sqlite"

export function luciaAuth(env: Bindings) {
    const { turso } = getConnection(env)

    return new Lucia(
        // i can't get the drizzle adapter working at all (works fine with SQLite3)
        // and i don't really have time to write my own rn , so i'm just gonna use the sqlite adapter
        // it is what it is :3
        new LibSQLAdapter(turso, {
            user: tableNames.authUser,
            session: tableNames.authSession,
        }),
        {
            getUserAttributes: (user) => {
                return {
                    avatarUrl: user.avatar_url,
                    bannerUrl: user.banner_url,
                    displayName: user.display_name,
                    username: user.username,
                    usernameColour: user.username_colour,
                    email: user.email,
                    emailVerified: Boolean(user.email_verified),
                    pronouns: user.pronouns,
                    verified: user.verified,
                    bio: user.bio,
                    dateJoined: user.date_joined,
                    isSupporter: Boolean(user.is_supporter),
                    supporterExpiresAt: user.supporter_expires_at,
                    isBanned: Boolean(user.is_banned),
                    isContributor: user.is_contributor,
                    roleFlags: user.role_flags,
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
            sessionCookie: {
                name: "user_auth_session",
                // i don't really see too much of a security concern with making the session cookie indefinite.
                // it's very unlikely that someone will be able to steal a session cookie, and if they do, it's
                // already handled with comparing IP/UA/Country Code. it expires the session
                // and it can just state that the session was logged out due to a security concern(and the user can just log back in)
                // plus i feel this is better user experience in general lol
                expires: false,
                attributes: {
                    secure: env.ENVIRONMENT === "PROD",
                    sameSite: env.ENVIRONMENT === "PROD" ? "strict" : "lax",
                    path: "/",
                },
            },
        }
    )
}

export type LuciaAuth = ReturnType<typeof luciaAuth>
