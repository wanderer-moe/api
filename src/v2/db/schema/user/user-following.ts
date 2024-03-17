import { tableNames } from "@/v2/db/drizzle"
import { relations } from "drizzle-orm"
import {
    sqliteTable,
    text,
    // uniqueIndex,
    index,
} from "drizzle-orm/sqlite-core"
import { authUser } from "./user"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"

/*
NOTE: this file manages the "social" aspect of users.
- This is where users can follow other users, and be followed by other users.
*/

export const userFollowing = sqliteTable(
    tableNames.userFollowing,
    {
        followerId: text("followerId")
            .notNull()
            .references(() => authUser.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
        followingId: text("followingId")
            .notNull()
            .references(() => authUser.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
        createdAt: text("createdAt")
            .notNull()
            .$defaultFn(() => {
                return new Date().toISOString()
            }),
    },
    (userFollowing) => {
        return {
            followerIdx: index("userfollowing_follower_idx").on(
                userFollowing.followerId
            ),
            followingIdx: index("userfollowing_following_idx").on(
                userFollowing.followingId
            ),
        }
    }
)

export type UserFollowing = typeof userFollowing.$inferSelect
export type NewUserFollowing = typeof userFollowing.$inferInsert
export const insertUserFollowingSchema = createInsertSchema(userFollowing)
export const selectUserFollowingSchema = createSelectSchema(userFollowing)

export const userFollowingRelations = relations(userFollowing, ({ one }) => ({
    follower: one(authUser, {
        fields: [userFollowing.followerId],
        references: [authUser.id],
        relationName: "follower",
    }),
    following: one(authUser, {
        fields: [userFollowing.followingId],
        references: [authUser.id],
        relationName: "following",
    }),
}))
