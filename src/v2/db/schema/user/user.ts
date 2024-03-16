import { tableNames } from "@/v2/db/drizzle"
import { relations } from "drizzle-orm"
import {
    sqliteTable,
    text,
    integer,
    // uniqueIndex,
    index,
} from "drizzle-orm/sqlite-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { generateID } from "@/v2/lib/oslo"
import { userFollowing } from "./user-following"
import { asset } from "../asset/asset"
import { userFavorite } from "./user-favorites"
import { socialsConnection } from "./user-connections"
import { userCollection } from "../collections/user-collections"
import { passwordResetToken } from "./user-attributes"
import { emailVerificationToken } from "./user-attributes"
import { assetExternalFile } from "../asset/asset-external-files"
import { userCollectionLikes } from "../collections/user-collection-likes"
import { userCollectionCollaborators } from "../collections/user-collections-collaborators"
import { assetLikes } from "../asset/asset-likes"
import { gameLikes } from "../game/game-likes"
import { assetTagLikes } from "../tags/asset-tags-likes"
import { assetCategoryLikes } from "../categories/asset-categories-likes"
import { requestForm, requestFormUpvotes } from "../supporter/request-form"
import { userBlocked } from "./user-blocked"
import { assetComments } from "../asset/asset-comments"

/*
NOTE: Very basic user information
- Users table is user information
- Keys table is login methods (i.e Credentials, OAuth, etc.)
*/

export type UserRoles =
    | "creator"
    | "staff"
    | "contributor"
    | "uploader"
    | "user"

export type UserPlan = "free" | "supporter"

export const authUser = sqliteTable(
    tableNames.authUser,
    {
        id: text("id")
            .primaryKey()
            .notNull()
            .$defaultFn(() => {
                return generateID()
            }),
        avatarUrl: text("avatar_url"),
        bannerUrl: text("banner_url"),
        displayName: text("display_name"),
        username: text("username").notNull().unique(),
        usernameColour: text("username_colour"),
        email: text("email").notNull(),
        emailVerified: integer("email_verified").default(0).notNull(),
        pronouns: text("pronouns"),
        verified: integer("verified").default(0).notNull(),
        bio: text("bio").default("No bio set").notNull(),
        dateJoined: text("date_joined")
            .notNull()
            .$defaultFn(() => {
                return new Date().toISOString()
            }),
        plan: text("plan").default("free").notNull().$type<UserPlan>(),
        isBanned: integer("is_banned", { mode: "boolean" })
            .default(false)
            .notNull(),
        isContributor: integer("is_contributor", { mode: "boolean" })
            .default(false)
            .notNull(),
        role: text("role").notNull().default("user").$type<UserRoles>(),
    },
    (user) => {
        return {
            userIdx: index("user_id_idx").on(user.id),
            usernameIdx: index("user_username_idx").on(user.username),
            emailIdx: index("user_email_idx").on(user.email),
            contributorIdx: index("user_contributor_idx").on(
                user.isContributor
            ),
        }
    }
)

export type User = typeof authUser.$inferSelect
export type NewUser = typeof authUser.$inferInsert
export const insertUserSchema = createInsertSchema(authUser)
export const selectUserSchema = createSelectSchema(authUser)

export const stripeUser = sqliteTable(
    tableNames.stripeUser,
    {
        id: text("id")
            .primaryKey()
            .notNull()
            .$defaultFn(() => {
                return generateID()
            }),
        userId: text("user_id")
            .notNull()
            .references(() => authUser.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
        customerId: text("stripe_customer_id"),
        subscriptionId: text("stripe_subscription_id"),
        endsAt: text("ends_at"),
        paidUntil: text("paid_until"),
    },
    (stripeUser) => {
        return {
            userIdx: index("stripe_user_user_id_idx").on(stripeUser.userId),
            stripeCustomerIdIdx: index("stripe_user_stripe_customer_id_idx").on(
                stripeUser.customerId
            ),
        }
    }
)

export type StripeUser = typeof stripeUser.$inferSelect
export type NewStripeUser = typeof stripeUser.$inferInsert
export const insertStripeUserSchema = createInsertSchema(stripeUser)
export const selectStripeUserSchema = createSelectSchema(stripeUser)

export const authCredentials = sqliteTable(
    tableNames.authCredentials,
    {
        id: text("id")
            .primaryKey()
            .notNull()
            .$defaultFn(() => {
                return generateID(20)
            }),
        userId: text("user_id")
            .notNull()
            .references(() => authUser.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
        hashedPassword: text("hashed_password"),
    },
    (key) => {
        return {
            userIdx: index("key_user_id_idx").on(key.userId),
        }
    }
)

export type AuthCredentials = typeof authCredentials.$inferSelect
export type NewAuthCredentials = typeof authCredentials.$inferInsert
export const insertAuthCredentialsSchema = createInsertSchema(authCredentials)
export const selectAuthCredentialsSchema = createSelectSchema(authCredentials)

// interface Session extends SessionAttributes {
// 	id: string;
// 	userId: string;
// 	expiresAt: Date;
// 	fresh: boolean;
// }

export const userSession = sqliteTable(
    tableNames.authSession,
    {
        id: text("id").primaryKey().notNull(),
        userId: text("user_id")
            .notNull()
            .references(() => authUser.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
        expiresAt: text("expires_at").notNull(),
        userAgent: text("user_agent").notNull(),
        countryCode: text("country_code").notNull(),
        ipAddress: text("ip_address").notNull(),
    },
    (session) => {
        return {
            userIdx: index("session_user_id_idx").on(session.userId),
        }
    }
)

export type Session = typeof userSession.$inferSelect
export type NewSession = typeof userSession.$inferInsert
export const insertSessionSchema = createInsertSchema(userSession)
export const selectSessionSchema = createSelectSchema(userSession)

export const usersRelations = relations(authUser, ({ one, many }) => ({
    follower: many(userFollowing, {
        relationName: "follower",
    }),
    following: many(userFollowing, {
        relationName: "following",
    }),
    blocked: many(userBlocked, {
        relationName: "blocked",
    }),
    blockedBy: many(userBlocked, {
        relationName: "blockedBy",
    }),
    authCredentials: one(authCredentials),
    userSession: many(userSession),
    asset: many(asset),
    assetExternalFile: many(assetExternalFile),
    userFavorite: one(userFavorite),
    userCollectionLikes: many(userCollectionLikes),
    assetLikes: many(assetLikes),
    assetComments: many(assetComments),
    socialsConnection: one(socialsConnection),
    userCollection: many(userCollection),
    stripeUser: one(stripeUser),
    passwordResetToken: one(passwordResetToken),
    emailVerificationToken: one(emailVerificationToken),
    gameLikes: many(gameLikes),
    assetTagLikes: many(assetTagLikes),
    assetCategoryLikes: many(assetCategoryLikes),
    userCollectionCollaborators: many(userCollectionCollaborators),
    requestForm: many(requestForm),
    requestFormUpvotes: many(requestFormUpvotes),
}))

export const stripeUserRelations = relations(stripeUser, ({ one }) => ({
    user: one(authUser, {
        fields: [stripeUser.userId],
        references: [authUser.id],
        relationName: "stripe_user",
    }),
}))

export const authCredentialsRelations = relations(
    authCredentials,
    ({ one }) => ({
        user: one(authUser, {
            fields: [authCredentials.userId],
            references: [authUser.id],
            relationName: "key_auth_user",
        }),
    })
)

export const sessionRelations = relations(userSession, ({ one }) => ({
    user: one(authUser, {
        fields: [userSession.userId],
        references: [authUser.id],
        relationName: "session_auth_user",
    }),
}))
