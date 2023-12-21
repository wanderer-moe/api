import { tableNames } from "@/v2/db/drizzle"
import { relations } from "drizzle-orm"
import {
    sqliteTable,
    text,
    // uniqueIndex,
    index,
} from "drizzle-orm/sqlite-core"
import { authUser } from "../user/user"
import { asset } from "./asset"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
export const assetLikes = sqliteTable(
    tableNames.assetLikes,
    {
        assetId: text("asset_id")
            .notNull()
            .references(() => asset.id),
        likedById: text("liked_by_id")
            .notNull()
            .references(() => authUser.id),
        createdAt: text("created_at")
            .notNull()
            .$defaultFn(() => {
                return new Date().toISOString()
            }),
    },
    (assetLikes) => {
        return {
            assetIdx: index("assetlikes_asset_idx").on(assetLikes.assetId),
            likedByIdx: index("assetlikes_likedBy_idx").on(
                assetLikes.likedById
            ),
        }
    }
)

export type AssetLikes = typeof assetLikes.$inferSelect
export type NewAssetLikes = typeof assetLikes.$inferInsert
export const insertAssetLikesSchema = createInsertSchema(assetLikes)
export const selectAssetLikesSchema = createSelectSchema(assetLikes)

export const assetNetworkingRelations = relations(assetLikes, ({ one }) => ({
    asset: one(asset, {
        fields: [assetLikes.assetId],
        references: [asset.id],
        relationName: "assetlikes_liked_asset",
    }),
    likedBy: one(authUser, {
        fields: [assetLikes.likedById],
        references: [authUser.id],
        relationName: "assetlikes_liked_by",
    }),
}))
