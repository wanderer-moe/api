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
import { createInsertSchema, createSelectSchema } from "drizzle-zod"

/*
NOTE: this allows for users down the line to link files to assets
*/

type AllowedFileTypes = "atlas" | "skel" | "png" | "jpg" | "jpeg" // this is just temporary

export const assetExternalFile = sqliteTable(
    tableNames.assetExternalFile,
    {
        id: text("id").primaryKey().notNull(),
        url: text("url").notNull(),
        uploadedById: text("uploaded_by")
            .notNull()
            .references(() => authUser.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
        uploadedByName: text("uploaded_by_name")
            .notNull()
            .references(() => authUser.username, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
        uploadedDate: text("uploaded_date")
            .notNull()
            .$defaultFn(() => {
                return new Date().toISOString()
            }),
        fileSize: integer("file_size").default(0).notNull(),
        fileType: text("file_type").notNull().$type<AllowedFileTypes>(),
    },
    (table) => {
        return {
            idIdx: index("asset_external_file_id_idx").on(table.id),
            uploadedByIdIdx: index("asset_external_file_uploaded_by_id_idx").on(
                table.uploadedById
            ),
            uploadedByNameIdx: index(
                "asset_external_file_uploaded_by_name_idx"
            ).on(table.uploadedByName),
        }
    }
)

export type AssetExtrnalFile = typeof assetExternalFile.$inferSelect
export type NewAssetExtrnalFile = typeof assetExternalFile.$inferInsert
export const insertExtrnalFileSchema = createInsertSchema(assetExternalFile)
export const selectExternalFileSchema = createSelectSchema(assetExternalFile)

export const assetExternalFileToAsset = sqliteTable(
    tableNames.assetExternalFileToAsset,
    {
        id: text("id").primaryKey().notNull(),
        assetExternalFileId: text("asset_external_file_id")
            .notNull()
            .references(() => assetExternalFile.id, {
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
    (assetExternalFileToAsset) => {
        return {
            assetExternalFileToAssetIdx: index(
                "asset_external_file_to_asset_id_idx"
            ).on(assetExternalFileToAsset.id),
            assetExternalFileToAssetFileIdx: index(
                "asset_external_file_to_asset_file_id_idx"
            ).on(assetExternalFileToAsset.assetExternalFileId),
            assetExternalFileToAssetAssetIdx: index(
                "asset_external_file_to_asset_asset_id_idx"
            ).on(assetExternalFileToAsset.assetId),
        }
    }
)

export type AssetExternalFileToAsset =
    typeof assetExternalFileToAsset.$inferSelect
export type NewAssetExternalFileToAsset =
    typeof assetExternalFileToAsset.$inferInsert
export const insertExternalFileToAssetSchema = createInsertSchema(
    assetExternalFileToAsset
)
export const selectExternalFileToAssetSchema = createSelectSchema(
    assetExternalFileToAsset
)

export const assetExternalFileRelations = relations(
    assetExternalFile,
    ({ one }) => ({
        assetExternalFileToAsset: one(assetExternalFileToAsset),
        uploadedBy: one(authUser, {
            fields: [assetExternalFile.uploadedById],
            references: [authUser.id],
            relationName: "asset_external_file_auth_user",
        }),
    })
)

export const assetExternalFileToAssetRelations = relations(
    assetExternalFileToAsset,
    ({ one }) => ({
        assetExternalFile: one(assetExternalFile, {
            fields: [assetExternalFileToAsset.assetExternalFileId],
            references: [assetExternalFile.id],
            relationName: "asset_external_file_external_file",
        }),
        asset: one(asset, {
            fields: [assetExternalFileToAsset.assetId],
            references: [asset.id],
            relationName: "asset_external_file_asset",
        }),
    })
)
