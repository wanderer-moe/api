import { lucia } from "lucia";
import { web } from "lucia/middleware";
import { prisma as prismaAdapter } from "@lucia-auth/adapter-prisma";
import __prisma from "./prisma";

export const auth = lucia({
    adapter: prismaAdapter(__prisma),
    env: "DEV",
    middleware: web(),
    sessionExpiresIn: {
        idlePeriod: 0,
        activePeriod: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
    sessionCookie: {
        expires: false,
    },
    // csrfProtection: {
    //     baseDomain:
    //     allowedSubDomains:
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
            role: dbUser.role,
            dateJoined: dbUser.date_joined,
        };
    },
});

export type Auth = typeof auth;
