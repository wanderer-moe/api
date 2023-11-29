import { tableNames } from "@/v2/db/drizzle"
import { relations } from "drizzle-orm"
import {
    sqliteTable,
    text,
    integer,
    // uniqueIndex,
    index,
} from "drizzle-orm/sqlite-core"
import { userFollowing } from "./user-following"
import { asset } from "../asset/asset"
import { userFavorite } from "./user-favorites"
import { savedOcGenerators } from "../oc-generators/oc-generators"
import { socialsConnection } from "./user-connections"
import { userCollection } from "../collections/user-collections"
import { passwordResetToken } from "./user-attributes"
import { emailVerificationToken } from "./user-attributes"
import { atlas } from "../asset/asset-atlas"
import { userCollectionLikes } from "../collections/user-collection-likes"
import { assetLikes } from "../asset/asset-likes"
import { gameLikes } from "../game/game-likes"
import { assetTagLikes } from "../tags/asset-tags-likes"
import { assetCategoryLikes } from "../categories/asset-categories-likes"

/*
NOTE: Very basic user information
- Users table is user information
- Keys table is login methods (i.e Credentials, OAuth, etc.)
*/

export const authUser = sqliteTable(
    tableNames.authUser,
    {
        id: text("id").unique().notNull(),
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
        roleFlags: integer("role_flags").default(1).notNull(),
        isContributor: integer("is_contributor", { mode: "boolean" })
            .default(false)
            .notNull(),
        selfAssignableRoleFlags: integer("self_assignable_role_flags")
            .default(0)
            .notNull(),
    },
    (user) => {
        return {
            userIdx: index("user_id_idx").on(user.id),
            usernameIdx: index("user_username_idx").on(user.username),
            emailIdx: index("user_email_idx").on(user.email),
        }
    }
)

export type User = typeof authUser.$inferSelect
export type NewUser = typeof authUser.$inferInsert

export const authKey = sqliteTable(
    tableNames.authKey,
    {
        id: text("id").unique().notNull(),
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

export type Keys = typeof authKey.$inferSelect
export type NewKeys = typeof authKey.$inferInsert

export const userSession = sqliteTable(
    tableNames.authSession,
    {
        id: text("id").unique().notNull(),
        activeExpires: integer("active_expires").notNull(),
        idleExpires: integer("idle_expires").notNull(),
        userId: text("user_id")
            .notNull()
            .references(() => authUser.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
    },
    (session) => {
        return {
            userIdx: index("session_user_id_idx").on(session.userId),
        }
    }
)

export type Session = typeof userSession.$inferSelect
export type NewSession = typeof userSession.$inferInsert

export const usersRelations = relations(authUser, ({ one, many }) => ({
    follower: many(userFollowing, {
        relationName: "follower",
    }),
    following: many(userFollowing, {
        relationName: "following",
    }),
    authKey: many(authKey),
    userSession: many(userSession),
    asset: many(asset),
    atlas: many(atlas),
    userFavorite: one(userFavorite),
    userCollectionLikes: many(userCollectionLikes),
    assetLikes: many(assetLikes),
    socialsConnection: one(socialsConnection),
    userCollection: many(userCollection),
    passwordResetToken: one(passwordResetToken),
    emailVerificationToken: one(emailVerificationToken),
    savedOcGenerators: many(savedOcGenerators),
    gameLikes: many(gameLikes),
    assetTagLikes: many(assetTagLikes),
    assetCategoryLikes: many(assetCategoryLikes),
}))

export const keysRelations = relations(authKey, ({ one }) => ({
    user: one(authUser, {
        fields: [authKey.userId],
        references: [authUser.id],
        relationName: "key_auth_user",
    }),
}))

export const sessionRelations = relations(userSession, ({ one }) => ({
    user: one(authUser, {
        fields: [userSession.userId],
        references: [authUser.id],
        relationName: "session_auth_user",
    }),
}))
