import { tableNames } from "@/v2/db/drizzle"
import { relations } from "drizzle-orm"
import {
    sqliteTable,
    text,
    integer,
    // uniqueIndex,
    index,
} from "drizzle-orm/sqlite-core"
import { userNetworking } from "./user-networking"
import { asset } from "../asset/asset"
import { userFavorite } from "./user-favorites"
import { savedOcGenerators } from "../oc-generators/oc-generators"
import { socialsConnection } from "./user-connections"
import { userCollection } from "./user-collections"
import { passwordResetToken } from "./user-attributes"
import { emailVerificationToken } from "./user-attributes"
import { atlas } from "../asset/asset-atlas"

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
        dateJoined: text("date_joined").notNull(),
        roleFlags: integer("role_flags").default(1).notNull(),
        isContributor: integer("is_contributor").default(0).notNull(),
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

export type Users = typeof authUser.$inferSelect
export type NewUsers = typeof authUser.$inferInsert

export const keys = sqliteTable(
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

export type Keys = typeof keys.$inferSelect
export type NewKeys = typeof keys.$inferInsert

export const usersRelations = relations(authUser, ({ one, many }) => ({
    follower: many(userNetworking, {
        relationName: "follower",
    }),
    following: many(userNetworking, {
        relationName: "following",
    }),
    key: many(keys),
    asset: many(asset),
    atlas: many(atlas),
    userFavorite: one(userFavorite),
    socialsConnection: one(socialsConnection),
    userCollection: many(userCollection),
    passwordResetToken: one(passwordResetToken),
    emailVerificationToken: one(emailVerificationToken),
    savedOcGenerators: many(savedOcGenerators),
}))

export const keysRelations = relations(keys, ({ one }) => ({
    user: one(authUser, {
        fields: [keys.userId],
        references: [authUser.id],
    }),
}))
