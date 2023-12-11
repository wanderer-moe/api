import { tableNames } from "@/v2/db/drizzle"
import { relations } from "drizzle-orm"
import { index, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { authUser } from "../user/user"
import { assetTag } from "./asset-tags"

export const assetTagLikes = sqliteTable(
    tableNames.assetTagLikes,
    {
        assetTagId: text("asset_id")
            .notNull()
            .references(() => assetTag.id),
        likedById: text("liked_by_id")
            .notNull()
            .references(() => authUser.id),
        createdAt: text("created_at")
            .notNull()
            .$defaultFn(() => {
                return new Date().toISOString()
            }),
    },
    (gameLikes) => {
        return {
            assetTagIdx: index("assetTagLikes_asset_idx").on(
                gameLikes.assetTagId
            ),
            likedByIdx: index("assetTagLikes_likedby_idx").on(
                gameLikes.likedById
            ),
        }
    }
)

export type AssetTagLikes = typeof assetTagLikes.$inferSelect
export type NewAssetTagLikes = typeof assetTagLikes.$inferInsert

export const assetTagLikesRelations = relations(assetTagLikes, ({ one }) => ({
    assetTag: one(assetTag, {
        fields: [assetTagLikes.assetTagId],
        references: [assetTag.id],
        relationName: "assetTagLikes_liked_assetTag",
    }),
    likedBy: one(authUser, {
        fields: [assetTagLikes.likedById],
        references: [authUser.id],
        relationName: "assetTagLikes_liked_by",
    }),
}))
