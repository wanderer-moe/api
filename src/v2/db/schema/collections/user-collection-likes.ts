import { tableNames } from "@/v2/db/drizzle"
import { relations } from "drizzle-orm"
import {
    sqliteTable,
    text,
    // uniqueIndex,
    index,
} from "drizzle-orm/sqlite-core"
import { authUser } from "../user/user"
import { userCollection } from "./user-collections"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"

export const userCollectionLikes = sqliteTable(
    tableNames.userCollectionLikes,
    {
        collectionId: text("collection_id")
            .notNull()
            .references(() => userCollection.id),
        likedById: text("liked_by_id")
            .notNull()
            .references(() => authUser.id),
        createdAt: text("createdAt")
            .notNull()
            .$defaultFn(() => {
                return new Date().toISOString()
            }),
    },
    (userCollectionLikes) => {
        return {
            collectionIdx: index("userCollectionNetworking_collection_idx").on(
                userCollectionLikes.collectionId
            ),
            likedByIdx: index("userCollectionNetworking_likedBy_idx").on(
                userCollectionLikes.likedById
            ),
        }
    }
)

export type UserCollectionLikes = typeof userCollectionLikes.$inferSelect
export type NewUserCollectionLikes = typeof userCollectionLikes.$inferInsert
export const insertUserCollectionLikesSchema =
    createInsertSchema(userCollectionLikes)
export const selectUserCollectionLikesSchema =
    createSelectSchema(userCollectionLikes)

export const userCollectionLikesRelations = relations(
    userCollectionLikes,
    ({ one }) => ({
        collection: one(userCollection, {
            fields: [userCollectionLikes.collectionId],
            references: [userCollection.id],
            relationName: "usercollectionlikes_liked_collection",
        }),
        likedBy: one(authUser, {
            fields: [userCollectionLikes.likedById],
            references: [authUser.id],
            relationName: "usercollectionlikes_liked_by",
        }),
    })
)
