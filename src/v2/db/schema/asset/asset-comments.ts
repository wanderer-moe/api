import { tableNames } from "@/v2/db/drizzle"
import { relations } from "drizzle-orm"
import {
    sqliteTable,
    text,
    // uniqueIndex,
    index,
    foreignKey,
} from "drizzle-orm/sqlite-core"
import { authUser } from "../user/user"
import { asset } from "./asset"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { generateID } from "@/v2/lib/oslo"

export const assetComments = sqliteTable(
    tableNames.assetComments,
    {
        id: text("comment_id")
            .primaryKey()
            .notNull()
            .$defaultFn(() => {
                return generateID(20)
            }),
        assetId: text("asset_id").references(() => asset.id, {
            onUpdate: "cascade",
            onDelete: "cascade",
        }),
        // typescript limitations means that the type will be set as `any` if we self reference, so we create FK manually
        parentCommentId: text("parent_comment_id"),
        commentedById: text("commented_by_id")
            .notNull()
            .references(() => authUser.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
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
            parentCommentFk: foreignKey({
                name: "self_reference_parent_comment_id",
                columns: [assetComments.parentCommentId],
                foreignColumns: [assetComments.id],
            }),
            assetIdx: index("assetcomments_asset_idx").on(
                assetComments.assetId
            ),
            parentCommentIdx: index("assetcomments_parent_comment_idx").on(
                assetComments.parentCommentId
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

export const assetCommentsLikes = sqliteTable(
    tableNames.assetCommentsLikes,
    {
        commentId: text("comment_id")
            .notNull()
            .references(() => assetComments.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
        likedById: text("liked_by_id")
            .notNull()
            .references(() => authUser.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
        createdAt: text("created_at")
            .notNull()
            .$defaultFn(() => {
                return new Date().toISOString()
            }),
    },
    (assetCommentsLikes) => {
        return {
            commentIdx: index("assetcommentslikes_comment_idx").on(
                assetCommentsLikes.commentId
            ),
            likedByIdx: index("assetcommentslikes_liked_by_idx").on(
                assetCommentsLikes.likedById
            ),
        }
    }
)

export type AssetCommentsLikes = typeof assetCommentsLikes.$inferSelect
export type NewAssetCommentsLikes = typeof assetCommentsLikes.$inferInsert

export const insertAssetCommentsLikesSchema =
    createInsertSchema(assetCommentsLikes)
export const selectAssetCommentsLikesSchema =
    createSelectSchema(assetCommentsLikes)

// not too sure about this
export const assetCommentsRelations = relations(
    assetComments,
    ({ one, many }) => ({
        asset: one(asset, {
            fields: [assetComments.assetId],
            references: [asset.id],
            relationName: "asset_comments_asset",
        }),
        commentedBy: one(authUser, {
            fields: [assetComments.commentedById],
            references: [authUser.id],
            relationName: "asset_comments_commented_by",
        }),
        assetCommentsLikes: many(assetCommentsLikes),
    })
)

export const assetCommentsLikesRelations = relations(
    assetCommentsLikes,
    ({ one }) => ({
        comment: one(assetComments, {
            fields: [assetCommentsLikes.commentId],
            references: [assetComments.id],
            relationName: "asset_comments_likes_comment",
        }),
        likedBy: one(authUser, {
            fields: [assetCommentsLikes.likedById],
            references: [authUser.id],
            relationName: "asset_comments_likes_liked_by",
        }),
    })
)
