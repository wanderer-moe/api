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

export const userCollectionNetworking = sqliteTable(
    tableNames.userCollectionNetworking,
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
    (userCollectionNetworking) => {
        return {
            collectionIdx: index("userCollectionNetworking_collection_idx").on(
                userCollectionNetworking.collectionId
            ),
            likedByIdx: index("userCollectionNetworking_likedBy_idx").on(
                userCollectionNetworking.likedById
            ),
        }
    }
)

export type UserCollectionNetworking =
    typeof userCollectionNetworking.$inferSelect
export type NewUserCollectionNetworking =
    typeof userCollectionNetworking.$inferInsert

export const userCollectionNetworkingRelations = relations(
    userCollectionNetworking,
    ({ one }) => ({
        collection: one(userCollection, {
            fields: [userCollectionNetworking.collectionId],
            references: [userCollection.id],
            relationName: "usercollection_liked_collection",
        }),
        likedBy: one(authUser, {
            fields: [userCollectionNetworking.likedById],
            references: [authUser.id],
            relationName: "usercollection_liked_by",
        }),
    })
)
