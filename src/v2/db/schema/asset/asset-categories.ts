import { tableNames } from "@/v2/db/drizzle"
import { relations } from "drizzle-orm"
import {
    sqliteTable,
    text,
    integer,
    // uniqueIndex,
    index,
} from "drizzle-orm/sqlite-core"
import { game } from "../game/game"
import { asset } from "./asset"

/*
NOTE: This setup can look kinda janky.
- All asset categories have a game associated with them. This is for better UX so users know what asset categories exist for a game.
- It's not a necessary join, but just nice to have.
*/

export const assetCategory = sqliteTable(
    tableNames.assetCategory,
    {
        id: text("id").unique().notNull(),
        name: text("name").unique().notNull(), // e.g tcg-sheets, splash-art
        formattedName: text("formatted_name").notNull(), // e.g TCG Sheets, Splash Art
        assetCount: integer("asset_count").default(0).notNull(),
        lastUpdated: text("last_updated").notNull(),
    },
    (assetCategory) => {
        return {
            assetCategoryIdx: index("asset_category_id_idx").on(
                assetCategory.id
            ),
            nameIdx: index("asset_category_name_idx").on(assetCategory.name),
        }
    }
)

export type AssetCategory = typeof assetCategory.$inferSelect
export type NewAssetCategory = typeof assetCategory.$inferInsert

export const gameAssetCategory = sqliteTable(
    tableNames.gameAssetCategory,
    {
        gameId: text("game_id")
            .notNull()
            .references(() => game.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
        assetCategoryId: text("asset_category_id")
            .notNull()
            .references(() => assetCategory.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
    },
    (gameAssetCategory) => {
        return {
            gameAssetCategoryGameIdx: index(
                "game_asset_category_game_id_idx"
            ).on(gameAssetCategory.gameId),
            gameAssetCategoryAssetCategoryIdx: index(
                "game_asset_category_asset_category_id_idx"
            ).on(gameAssetCategory.assetCategoryId),
        }
    }
)

export type GameAssetCategory = typeof gameAssetCategory.$inferSelect
export type NewGameAssetCategory = typeof gameAssetCategory.$inferInsert

export const assetCategoryRelations = relations(assetCategory, ({ many }) => ({
    asset: many(asset),
    gameAssetCategory: many(gameAssetCategory),
}))

export const gameAssetCategoryRelations = relations(
    gameAssetCategory,
    ({ one }) => ({
        game: one(game, {
            fields: [gameAssetCategory.gameId],
            references: [game.id],
            relationName: "gameassetcategory_game",
        }),
        assetCategory: one(assetCategory, {
            fields: [gameAssetCategory.assetCategoryId],
            references: [assetCategory.id],
            relationName: "gameassetcategory_assetcategory",
        }),
    })
)
