import { tableNames } from "@/v2/db/drizzle"
import { relations } from "drizzle-orm"
import {
    sqliteTable,
    text,
    // uniqueIndex,
    index,
    integer,
} from "drizzle-orm/sqlite-core"
import { authUser } from "../user/user"
import { asset } from "./asset"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"

export const assetComments = sqliteTable(
    tableNames.assetComments,
    {
        assetId: integer("asset_id")
            .notNull()
            .references(() => asset.id),
        commentedById: text("liked_by_id")
            .notNull()
            .references(() => authUser.id),
        comment: text("comment").notNull(),
        createdAt: text("created_at")
            .notNull()
            .$defaultFn(() => {
                return new Date().toISOString()
            }),
        editedAt: text("edited_at").default(null),
    },
    (assetComments) => {
        return {
            assetIdx: index("assetcomments_asset_idx").on(
                assetComments.assetId
            ),
            commentedByIdx: index("assetcomments_commented_by_idx").on(
                assetComments.commentedById
            ),
        }
    }
)

export type AssetComments = typeof assetComments.$inferSelect
export type NewAssetComments = typeof assetComments.$inferInsert

export const insertAssetCommentsSchema = createInsertSchema(assetComments)
export const selectAssetCommentsSchema = createSelectSchema(assetComments)

export const assetCommentsRelations = relations(assetComments, ({ one }) => ({
    asset: one(asset, {
        fields: [assetComments.assetId],
        references: [asset.id],
        relationName: "assetcomments_asset",
    }),
    commentedBy: one(authUser, {
        fields: [assetComments.commentedById],
        references: [authUser.id],
        relationName: "assetcomments_commented_by",
    }),
}))
