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
import { assetCategory } from "./asset-categories"
import { game } from "../game/game"
import { assetTagAsset } from "./asset-tags"
import { atlasToAsset } from "./asset-atlas"

/*
NOTE: Assets have a lot of relations, and can be quite complex in some cases.
- UploadedBy: Linked to the user who uploaded the asset.
- AssetTagAsset: Linked to the tags the asset has, as an asset can have multiple tags, e.g "official", "1.0"
- AssetCategory: Linked to the category the asset is in, e.g "charcter sheets"
- Game: Linked to the game the asset is for, e.g "genshin-impact"

Then, they are also used as relations when adding to collections or favorites.
*/

export type AssetStatus = "pending" | "approved" | "rejected"

export const asset = sqliteTable(
    tableNames.asset,
    {
        id: integer("id").primaryKey(), // primary key auto increments on sqlite
        name: text("name").notNull(),
        extension: text("extension").notNull(),
        gameId: text("game")
            .references(() => game.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }).notNull(),
        assetCategoryId: text("asset_category")
            .references(() => assetCategory.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }).notNull(),
        uploadedById: text("uploaded_by").references(() => authUser.id, {
            onUpdate: "cascade",
            onDelete: "cascade",
        }).notNull(),
        url: text("url").notNull(),
        status: text("status")
            .$type<AssetStatus>()
            .default("pending")
            .notNull(),
        uploadedDate: text("uploaded_date").notNull(),
        assetIsOptimized: integer("asset_is_optimized").default(0).notNull(),
        viewCount: integer("view_count").default(0).notNull(),
        downloadCount: integer("download_count").default(0).notNull(),
        fileSize: integer("file_size").default(0).notNull(),
        width: integer("width").default(0).notNull(),
        height: integer("height").default(0).notNull(),
    },
    (table) => {
        return {
            idIdx: index("assets_id_idx").on(table.id),
            nameIdx: index("assets_name_idx").on(table.name),
            gameIdIdx: index("assets_game_name_idx").on(table.gameId),
            assetCategoryIdIdx: index("assets_asset_category_name_idx").on(
                table.assetCategoryId
            ),
            uploadedByIdIdx: index("assets_uploaded_by_id_idx").on(
                table.uploadedById
            ),
        }
    }
)

export type Asset = typeof asset.$inferSelect
export type NewAsset = typeof asset.$inferInsert

export const assetRelations = relations(asset, ({ one, many }) => ({
    assetTagAsset: many(assetTagAsset),
    atlas: many(atlasToAsset),
    authUser: one(authUser, {
        fields: [asset.uploadedById],
        references: [authUser.id],
    }),
    game: one(game, {
        fields: [asset.gameId],
        references: [game.id],
    }),
    assetCategory: one(assetCategory, {
        fields: [asset.gameId],
        references: [assetCategory.id],
    }),
}))
