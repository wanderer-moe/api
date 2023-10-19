import { tableNames } from "@/v2/db/drizzle"
import { relations } from "drizzle-orm"
import {
    sqliteTable,
    text,
    integer,
    // uniqueIndex,
    index,
} from "drizzle-orm/sqlite-core"
import { users } from "./user"
import { assets } from "../asset/asset"

/*
NOTE: this file is where users store their collections of assets.
- UserCollection is the collection itself, which has a name, description, and whether it's public or not.
- UserCollectionAsset is the join table between UserCollection and Asset, which stores the assets in the collection.
*/

export const userCollection = sqliteTable(
    tableNames.userCollection,
    {
        id: text("id").primaryKey(),
        name: text("name").notNull(),
        description: text("description").notNull(),
        userId: text("user_id")
            .notNull()
            .references(() => users.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
        dateCreated: text("date_created").notNull(),
        isPublic: integer("is_public").default(0).notNull(),
    },
    (collection) => {
        return {
            collectionIdx: index("collection_id_idx").on(collection.id),
            userCollectionIdx: index("user_collection_id_idx").on(
                collection.userId
            ),
        }
    }
)

export type UserCollection = typeof userCollection.$inferSelect
export type NewUserCollection = typeof userCollection.$inferInsert

export const userCollectionAsset = sqliteTable(
    tableNames.userCollectionAsset,
    {
        id: text("id").primaryKey(),
        collectionId: text("collection_id")
            .notNull()
            .references(() => userCollection.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
        assetId: integer("asset_id")
            .notNull()
            .references(() => assets.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
    },
    (collectionAssets) => {
        return {
            collectionAssetsIdx: index("collection_assets_id_idx").on(
                collectionAssets.id
            ),
            collectionAssetsCollectionIdx: index(
                "collection_assets_collection_id_idx"
            ).on(collectionAssets.collectionId),
            collectionAssetsAssetIdx: index(
                "collection_assets_asset_id_idx"
            ).on(collectionAssets.assetId),
        }
    }
)

export type UserCollectionAsset = typeof userCollectionAsset.$inferSelect
export type NewUserCollectionAsset = typeof userCollectionAsset.$inferInsert

export const collectionRelations = relations(
    userCollection,
    ({ one, many }) => ({
        user: one(users, {
            fields: [userCollection.userId],
            references: [users.id],
        }),
        assets: many(userCollectionAsset),
    })
)

export const collectionAssetsRelations = relations(
    userCollectionAsset,
    ({ one }) => ({
        collection: one(userCollection, {
            fields: [userCollectionAsset.collectionId],
            references: [userCollection.id],
        }),
        asset: one(assets, {
            fields: [userCollectionAsset.assetId],
            references: [assets.id],
        }),
    })
)
