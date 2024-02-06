import { tableNames } from "@/v2/db/drizzle"
import { relations } from "drizzle-orm"
import {
    sqliteTable,
    text,
    integer,
    // uniqueIndex,
    index,
} from "drizzle-orm/sqlite-core"
import { authUser } from "../user/user"
import { asset } from "../asset/asset"
import { generateID } from "@/v2/lib/oslo"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { userCollectionLikes } from "./user-collection-likes"
import { userCollectionCollaborators } from "./user-collections-collaborators"
import type { ColourType } from "@/v2/lib/colour"

/*
NOTE: this file is where users store their collections of assets.
- UserCollection is the collection itself, which has a name, description, and whether it's public or not.
- UserCollectionAsset is the join table between UserCollection and Asset, which stores the assets in the collection.
*/

export const userCollection = sqliteTable(
    tableNames.userCollection,
    {
        id: text("id")
            .primaryKey()
            .notNull()
            .$defaultFn(() => {
                return generateID()
            }),
        name: text("name").notNull(),
        description: text("description").notNull(),
        userId: text("user_id")
            .notNull()
            .references(() => authUser.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
        dateCreated: text("date_created")
            .notNull()
            .$defaultFn(() => {
                return new Date().toISOString()
            }),
        accentColour: text("accent_colour").$type<ColourType>(),
        isPublic: integer("is_public", { mode: "boolean" })
            .default(false)
            .notNull(),
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
export const insertUserCollectionSchema = createInsertSchema(userCollection)
export const selectUserCollectionSchema = createSelectSchema(userCollection)

export const userCollectionAsset = sqliteTable(
    tableNames.userCollectionAsset,
    {
        collectionId: text("collection_id")
            .notNull()
            .references(() => userCollection.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
        assetId: integer("asset_id")
            .notNull()
            .references(() => asset.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
        dateAdded: text("date_added")
            .notNull()
            .$defaultFn(() => {
                return new Date().toISOString()
            }),
    },
    (collectionAssets) => {
        return {
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
export const insertUserCollectionAssetSchema =
    createInsertSchema(userCollectionAsset)
export const selectUserCollectionAssetSchema =
    createSelectSchema(userCollectionAsset)

export const collectionRelations = relations(
    userCollection,
    ({ one, many }) => ({
        user: one(authUser, {
            fields: [userCollection.userId],
            references: [authUser.id],
            relationName: "collection_auth_user",
        }),
        assets: many(userCollectionAsset),
        userCollectionLikes: many(userCollectionLikes),
        userCollectionCollaborators: many(userCollectionCollaborators),
    })
)

export const collectionAssetsRelations = relations(
    userCollectionAsset,
    ({ one }) => ({
        collection: one(userCollection, {
            fields: [userCollectionAsset.collectionId],
            references: [userCollection.id],
            relationName: "collectionassets_collection",
        }),
        asset: one(asset, {
            fields: [userCollectionAsset.assetId],
            references: [asset.id],
            relationName: "collectionassets_asset",
        }),
    })
)
