import { tableNames } from "@/v2/db/drizzle"
import { relations } from "drizzle-orm"
import {
    sqliteTable,
    text,
    integer,
    // uniqueIndex,
    index,
} from "drizzle-orm/sqlite-core"
import { asset } from "./asset"
import { authUser } from "../user/user"

export const atlas = sqliteTable(
    tableNames.atlas,
    {
        id: text("id").primaryKey(),
        url: text("url").notNull(),
        uploadedById: text("uploaded_by").notNull(),
        uploadedByName: text("uploaded_by_name").notNull(),
        uploadedDate: integer("uploaded_date").notNull(),
        fileSize: integer("file_size").default(0).notNull(),
    },
    (table) => {
        return {
            idIdx: index("atlas_id_idx").on(table.id),
            uploadedByIdIdx: index("atlas_uploaded_by_idx").on(
                table.uploadedById
            ),
            uploadedByNameIdx: index("atlas_uploaded_by_name_idx").on(
                table.uploadedByName
            ),
        }
    }
)

export type Atlas = typeof atlas.$inferSelect
export type NewAtlas = typeof atlas.$inferInsert

export const atlasToAsset = sqliteTable(
    tableNames.atlasToAsset,
    {
        id: text("id").primaryKey(),
        atlasId: text("atlas_id")
            .notNull()
            .references(() => atlas.id, {
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
    (atlasToAsset) => {
        return {
            atlasToAssetIdx: index("atlas_to_assets_id_idx").on(
                atlasToAsset.id
            ),
            atlasToAssetAtlasIdx: index("atlas_to_assets_atlas_id_idx").on(
                atlasToAsset.atlasId
            ),
            atlasToAssetAssetIdx: index("atlas_to_assets_asset_id_idx").on(
                atlasToAsset.assetId
            ),
        }
    }
)

export type AtlasToAsset = typeof atlasToAsset.$inferSelect
export type NewAtlasToAsset = typeof atlasToAsset.$inferInsert

export const atlasRelations = relations(atlas, ({ one }) => ({
    atlasToAsset: one(atlasToAsset),
    uploadedBy: one(authUser, {
        fields: [atlas.uploadedById, atlas.uploadedByName],
        references: [authUser.id, authUser.username],
    }),
}))

export const atlasToAssetRelations = relations(atlasToAsset, ({ one }) => ({
    atlas: one(atlas, {
        fields: [atlasToAsset.atlasId],
        references: [atlas.id],
    }),
    asset: one(asset, {
        fields: [atlasToAsset.assetId],
        references: [asset.id],
    }),
}))
