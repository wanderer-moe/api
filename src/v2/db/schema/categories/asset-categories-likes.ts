import { tableNames } from "@/v2/db/drizzle"
import { relations } from "drizzle-orm"
import { index, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { authUser } from "../user/user"
import { assetCategory } from "./asset-categories"

export const assetCategoryLikes = sqliteTable(
    tableNames.assetCategoryLikes,
    {
        assetCategoryId: text("asset_id")
            .notNull()
            .references(() => assetCategory.id),
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
            assetCategoryIdx: index("assetCategoryLikes_asset_idx").on(
                gameLikes.assetCategoryId
            ),
            likedByIdx: index("assetCategoryLikes_likedby_idx").on(
                gameLikes.likedById
            ),
        }
    }
)

export type AssetCategoryLikes = typeof assetCategoryLikes.$inferSelect
export type NewAssetCategoryLikes = typeof assetCategoryLikes.$inferInsert

export const assetCategoryLikesRelations = relations(
    assetCategoryLikes,
    ({ one }) => ({
        assetCategory: one(assetCategory, {
            fields: [assetCategoryLikes.assetCategoryId],
            references: [assetCategory.id],
            relationName: "assetCategoryLikes_liked_assetCategory",
        }),
        likedBy: one(authUser, {
            fields: [assetCategoryLikes.likedById],
            references: [authUser.id],
            relationName: "assetTagLikes_liked_by",
        }),
    })
)
