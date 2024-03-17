import { tableNames } from "@/v2/db/drizzle"
import { relations } from "drizzle-orm"
import {
    sqliteTable,
    text,
    integer,
    // uniqueIndex,
    index,
} from "drizzle-orm/sqlite-core"
import { authUser } from "./user"
import { asset } from "../asset/asset"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { generateID } from "@/v2/lib/oslo"

/*
NOTE: this file is users favourite assets.
- Think of it as being similar to likes, where you can favourite multiple assets but only have one set of favourites.
- Everything else is managed within collections when uers want to organize their assets.
*/

export const userFavourite = sqliteTable(
    tableNames.userFavourite,
    {
        id: text("id")
            .unique()
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
        isPublic: integer("is_public", { mode: "boolean" })
            .default(false)
            .notNull(),
    },
    (userFavourite) => {
        return {
            favouritedAssetsIdx: index("favourited_assets_id_idx").on(
                userFavourite.id
            ),
            favouritedAssetsUserIdx: index("favourited_assets_user_id_idx").on(
                userFavourite.userId
            ),
        }
    }
)

export type UserFavourite = typeof userFavourite.$inferSelect
export type NewUserFavourite = typeof userFavourite.$inferInsert
export const insertUserFavouriteSchema = createInsertSchema(userFavourite)
export const selectUserFavouriteSchema = createSelectSchema(userFavourite)

export const userFavouriteAsset = sqliteTable(
    tableNames.userFavouriteAsset,
    {
        id: text("id")
            .primaryKey()
            .notNull()
            .$defaultFn(() => {
                return generateID()
            }),
        userFavouriteId: text("favourited_assets_id")
            .notNull()
            .references(() => userFavourite.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
        assetId: integer("asset_id")
            .notNull()
            .references(() => asset.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
    },
    (userFavouriteAsset) => {
        return {
            favouritedAssetsAssetsIdx: index(
                "favourited_assets_assets_id_idx"
            ).on(userFavouriteAsset.id),
            favouritedAssetsAssetsUserIdx: index(
                "favourited_assets_assets_user_id_idx"
            ).on(userFavouriteAsset.userFavouriteId),
            favouritedAssetsAssetsAssetIdx: index(
                "favourited_assets_assets_asset_id_idx"
            ).on(userFavouriteAsset.assetId),
        }
    }
)

export type UserFavouriteAsset = typeof userFavouriteAsset.$inferSelect
export type NewUserFavouriteAsset = typeof userFavouriteAsset.$inferInsert
export const insertUserFavouriteAssetSchema =
    createInsertSchema(userFavouriteAsset)
export const selectUserFavouriteAssetSchema =
    createSelectSchema(userFavouriteAsset)

export const userFavouriteRelations = relations(userFavourite, ({ one }) => ({
    user: one(authUser, {
        fields: [userFavourite.userId],
        references: [authUser.id],
        relationName: "userfavourite_auth_user",
    }),
}))

export const userFavouriteAssetRelations = relations(
    userFavouriteAsset,
    ({ one }) => ({
        favouritedAssets: one(userFavourite, {
            fields: [userFavouriteAsset.userFavouriteId],
            references: [userFavourite.id],
            relationName: "favouritedassets_userfavourite",
        }),
        asset: one(asset, {
            fields: [userFavouriteAsset.assetId],
            references: [asset.id],
            relationName: "favouritedassets_asset",
        }),
    })
)
