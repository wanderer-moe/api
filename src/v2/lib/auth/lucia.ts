import { Lucia } from "lucia"
import { getConnection } from "@/v2/db/turso"
import { tableNames } from "@/v2/db/drizzle"
import { LibSQLAdapter } from "@lucia-auth/adapter-sqlite"

export function luciaAuth(env: Bindings) {
    const { turso } = getConnection(env)

    // TODO(dromzeh): should probably utilize to the v3 drizzle adapter - it's okay for now though
    return new Lucia(
        new LibSQLAdapter(turso, {
            user: tableNames.authUser,
            session: tableNames.authSession,
        }),
        {
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
            sessionCookie: {
                name: "user_auth_session",
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

export type Auth = ReturnType<typeof luciaAuth>
