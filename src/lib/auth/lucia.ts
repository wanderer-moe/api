import { lucia } from "lucia";
import { web } from "lucia/middleware";
import { planetscale } from "@lucia-auth/adapter-mysql";
import { getConnection } from "../planetscale";
import { Env } from "@/worker-configuration";

export const authorizationTokenNames = {
    csrf: "__csrf_token",
    session: "__session_token",
};

export const auth = (env: Env) => {
    const db = getConnection(env);
    const connection = db.planetscale;

    return lucia({
        adapter: planetscale(connection, {
            key: "authKey",
            user: "authUser",
            session: "authSession",
        }),
        middleware: web(),
        sessionExpiresIn: {
            idlePeriod: 0,
            activePeriod: 30 * 24 * 60 * 60 * 1000, // 30 days
        },
        sessionCookie: {
            name: authorizationTokenNames.session,
            expires: false,
        },
        env: env.ENVIRONMENT === "DEV" ? "DEV" : "PROD",
        experimental: {
            debugMode: env.ENVIRONMENT === "DEV" ? true : false,
        },
        getUserAttributes: (dbUser) => {
            return {
                username: dbUser.username,
                usernameColour: dbUser.username_colour,
                avatarUrl: dbUser.avatar_url,
                bannerUrl: dbUser.banner_url,
                email: dbUser.email,
                emailVerified: dbUser.email_verified,
                pronouns: dbUser.pronouns,
                verified: dbUser.verified,
                bio: dbUser.bio,
                roleFlags: dbUser.role_flags,
                selfAssignableRoleFlags: dbUser.self_assignable_role_flags,
                dateJoined: dbUser.date_joined,
            };
        },
    });
};

export type Auth = typeof auth;
