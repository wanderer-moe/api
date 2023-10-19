import { tableNames } from "@/v2/db/drizzle"
import { relations } from "drizzle-orm"
import {
    sqliteTable,
    text,
    integer,
    // uniqueIndex,
    index,
} from "drizzle-orm/sqlite-core"
import { assets } from "./asset"

/*
NOTE: Asset tags are not stored as ENUMs to allow for better UX, flexibility, and extensibility.
- AssetTag: A tag that can be applied to an asset.
- AssetTagAsset: A join table that associates an asset with an asset tag.
*/

export const assetTag = sqliteTable(
    tableNames.assetTag,
    {
        id: text("id").primaryKey(),
        name: text("name").notNull(),
        formattedName: text("formatted_name").notNull(),
        assetCount: integer("asset_count").default(0).notNull(),
        lastUpdated: integer("last_updated").notNull(),
    },
    (assetTag) => {
        return {
            assetTagIdx: index("asset_tag_id_idx").on(assetTag.id),
            nameIdx: index("asset_tag_name_idx").on(assetTag.name),
        }
    }
)

export type AssetTag = typeof assetTag.$inferSelect
export type NewAssetTag = typeof assetTag.$inferInsert

export const assetTagAsset = sqliteTable(
    tableNames.assetTagAsset,
    {
        id: text("id").primaryKey(),
        assetTagId: text("asset_tag_id")
            .notNull()
            .references(() => assetTag.id, {
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
    (assetTagAsset) => {
        return {
            assetTagAssetIdx: index("asset_tags_assets_id_idx").on(
                assetTagAsset.id
            ),
            assetTagAssetAssetTagIdx: index(
                "asset_tags_assets_asset_tag_id_idx"
            ).on(assetTagAsset.assetTagId),
            assetTagAssetAssetIdx: index("asset_tags_assets_asset_id_idx").on(
                assetTagAsset.assetId
            ),
        }
    }
)

export type AssetTagAsset = typeof assetTagAsset.$inferSelect
export type NewAssetTagAsset = typeof assetTagAsset.$inferInsert

export const assetTagAssetRelations = relations(assetTagAsset, ({ one }) => ({
    assetTag: one(assetTag, {
        fields: [assetTagAsset.assetTagId],
        references: [assetTag.id],
    }),
    asset: one(assets, {
        fields: [assetTagAsset.assetId],
        references: [assets.id],
    }),
}))
