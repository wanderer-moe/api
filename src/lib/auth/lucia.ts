import { lucia } from "lucia";
import { web } from "lucia/middleware";
import { prisma as prismaAdapter } from "@lucia-auth/adapter-prisma";
import __prisma from "./prisma";

export const authorizationTokenNames = {
    csrf: "__csrf_token",
    session: "__session_token",
};

export const auth = lucia({
    adapter: prismaAdapter(__prisma),
    env: "DEV",
    middleware: web(),
    sessionExpiresIn: {
        idlePeriod: 0,
        activePeriod: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
    sessionCookie: {
        name: authorizationTokenNames.session,
        expires: false,
    },
    // csrfProtection: {
    //     baseDomain: "localhost",
    //     allowedSubDomains: "*"
    // },
    experimental: {
        debugMode: true,
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

export type Auth = typeof auth;
