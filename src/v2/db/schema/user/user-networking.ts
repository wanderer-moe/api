import { tableNames } from "@/v2/db/drizzle"
import { relations } from "drizzle-orm"
import {
    sqliteTable,
    text,
    // uniqueIndex,
    index,
} from "drizzle-orm/sqlite-core"
import { users } from "./user"

/*
NOTE: this file manages the "social" aspect of users.
- This is where users can follow other users, and be followed by other users.
*/

export const userNetworking = sqliteTable(
    tableNames.userNetworking,
    {
        followerId: text("followerId")
            .notNull()
            .references(() => users.id),
        followingId: text("followingId")
            .notNull()
            .references(() => users.id),
        createdAt: text("createdAt").notNull(),
        updatedAt: text("updatedAt").notNull(),
    },
    (userNetworking) => {
        return {
            followerIdx: index("userNetworking_follower_idx").on(
                userNetworking.followerId
            ),
            followingIdx: index("userNetworking_following_idx").on(
                userNetworking.followingId
            ),
        }
    }
)

export type UserNetworking = typeof userNetworking.$inferSelect
export type NewUserNetworking = typeof userNetworking.$inferInsert

export const userNetworkingRelations = relations(userNetworking, ({ one }) => ({
    follower: one(users, {
        fields: [userNetworking.followerId],
        references: [users.id],
        relationName: "follower",
    }),
    following: one(users, {
        fields: [userNetworking.followingId],
        references: [users.id],
        relationName: "following",
    }),
}))
