import { lucia } from "lucia";
import { hono } from "lucia/middleware";
import { planetscale } from "@lucia-auth/adapter-mysql";
import { getConnection } from "../planetscale";
import { Env } from "@/worker-configuration";
import { tableNames } from "../drizzle";

// this is so we can pass in env during requests,
// so: it would be called: auth(c.env)... instead of auth
export const auth = (env: Env) => {
    const db = getConnection(env);
    const connection = db.planetscale;

    return lucia({
        adapter: planetscale(connection, {
            key: tableNames.authKey,
            user: tableNames.authUser,
            session: tableNames.authSession,
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
        // csrfProtection: {
        //     baseDomain: env.ENVIRONMENT === "DEV" ? "localhost" : "wanderer.moe",
        //     allowedSubDomains: ["*"],
        // },
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
