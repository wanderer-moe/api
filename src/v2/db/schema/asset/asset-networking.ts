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

export const assetNetworking = sqliteTable(
    tableNames.assetNetworking,
    {
        assetId: text("follower_id")
            .notNull()
            .references(() => authUser.id),
        likedById: text("following_id")
            .notNull()
            .references(() => authUser.id),
        createdAt: text("created_at")
            .notNull()
            .$defaultFn(() => {
                return new Date().toISOString()
            }),
    },
    (assetNetworking) => {
        return {
            assetIdx: index("assetNetworking_likedAsset_idx").on(
                assetNetworking.assetId
            ),
            likedByIdx: index("assetNetworking_likedBy_idx").on(
                assetNetworking.likedById
            ),
        }
    }
)

export type AssetNetworking = typeof assetNetworking.$inferSelect
export type NewAssetNetworking = typeof assetNetworking.$inferInsert

export const assetNetworkingRelations = relations(
    assetNetworking,
    ({ one }) => ({
        asset: one(asset, {
            fields: [assetNetworking.assetId],
            references: [asset.id],
            relationName: "assetnetworking_liked_asset",
        }),
        likedBy: one(authUser, {
            fields: [assetNetworking.likedById],
            references: [authUser.id],
            relationName: "assetnetworking_liked_by",
        }),
    })
)
