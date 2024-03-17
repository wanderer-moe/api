import { tableNames } from "@/v2/db/drizzle"
import { relations } from "drizzle-orm"
import {
    sqliteTable,
    text,
    integer,
    // uniqueIndex,
    index,
} from "drizzle-orm/sqlite-core"
import { asset } from "../asset/asset"
import { assetTagLikes } from "./asset-tags-likes"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"

/*
NOTE: Asset tags are not stored as ENUMs to allow for better UX, flexibility, and extensibility.
- AssetTag: A tag that can be applied to an asset.
- AssetTagAsset: A join table that associates an asset with an asset tag.
*/

export const assetTag = sqliteTable(
    tableNames.assetTag,
    {
        id: text("id").primaryKey().notNull(),
        name: text("name").notNull().unique(),
        formattedName: text("formatted_name").notNull(),
        lastUpdated: text("last_updated").notNull(),
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
export const insertAssetTagSchema = createInsertSchema(assetTag)
export const selectAssetTagSchema = createSelectSchema(assetTag)

export const assetTagAsset = sqliteTable(
    tableNames.assetTagAsset,
    {
        assetTagId: text("asset_tag_id")
            .notNull()
            .references(() => assetTag.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
        assetId: text("asset_id")
            .notNull()
            .references(() => asset.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
    },
    (assetTagAsset) => {
        return {
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
export const insertAssetTagAssetSchema = createInsertSchema(assetTagAsset)
export const selectAssetTagAssetSchema = createSelectSchema(assetTagAsset)

export const assetTagRelations = relations(assetTag, ({ many }) => ({
    assetTagAsset: many(assetTagAsset),
    assetTagLikes: many(assetTagLikes),
}))

export const assetTagAssetRelations = relations(assetTagAsset, ({ one }) => ({
    assetTag: one(assetTag, {
        fields: [assetTagAsset.assetTagId],
        references: [assetTag.id],
        relationName: "assettagasset_assettag",
    }),
    asset: one(asset, {
        fields: [assetTagAsset.assetId],
        references: [asset.id],
        relationName: "assettagasset_asset",
    }),
}))
