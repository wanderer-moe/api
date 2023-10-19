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
NOTE: this file is users favorite assets.
- Think of it as being similar to likes, where you can favorite multiple assets but only have one set of favorites.
- Everything else is managed within collections when uers want to organize their assets.
*/

export const userFavorite = sqliteTable(
    tableNames.userFavorite,
    {
        id: text("id").primaryKey(),
        userId: text("user_id")
            .notNull()
            .references(() => users.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
        isPublic: integer("is_public").default(0).notNull(),
    },
    (userFavorite) => {
        return {
            favoritedAssetsIdx: index("favorited_assets_id_idx").on(
                userFavorite.id
            ),
            favoritedAssetsUserIdx: index("favorited_assets_user_id_idx").on(
                userFavorite.userId
            ),
        }
    }
)

export type UserFavorite = typeof userFavorite.$inferSelect
export type NewUserFavorite = typeof userFavorite.$inferInsert

export const userFavoriteAsset = sqliteTable(
    tableNames.userFavoriteAsset,
    {
        id: text("id").primaryKey(),
        userFavoriteId: text("favorited_assets_id")
            .notNull()
            .references(() => userFavorite.id, {
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
    (userFavoriteAsset) => {
        return {
            favoritedAssetsAssetsIdx: index(
                "favorited_assets_assets_id_idx"
            ).on(userFavoriteAsset.id),
            favoritedAssetsAssetsUserIdx: index(
                "favorited_assets_assets_user_id_idx"
            ).on(userFavoriteAsset.userFavoriteId),
            favoritedAssetsAssetsAssetIdx: index(
                "favorited_assets_assets_asset_id_idx"
            ).on(userFavoriteAsset.assetId),
        }
    }
)

export type UserFavoriteAsset = typeof userFavoriteAsset.$inferSelect
export type NewUserFavoriteAsset = typeof userFavoriteAsset.$inferInsert

export const userFavoriteRelations = relations(userFavorite, ({ one }) => ({
    user: one(users, {
        fields: [userFavorite.userId],
        references: [users.id],
    }),
}))

export const userFavoriteAssetRelations = relations(
    userFavoriteAsset,
    ({ one }) => ({
        favoritedAssets: one(userFavorite, {
            fields: [userFavoriteAsset.userFavoriteId],
            references: [userFavorite.id],
        }),
        asset: one(assets, {
            fields: [userFavoriteAsset.assetId],
            references: [assets.id],
        }),
    })
)
