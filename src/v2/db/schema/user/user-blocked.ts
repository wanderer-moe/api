import { tableNames } from "@/v2/db/drizzle"
import { relations } from "drizzle-orm"
import {
    sqliteTable,
    text,
    // uniqueIndex,
    index,
} from "drizzle-orm/sqlite-core"
import { authUser } from "./user"
import { generateID } from "@/v2/lib/oslo"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"

export const userBlocked = sqliteTable(
    tableNames.userBlocked,
    {
        id: text("id")
            .primaryKey()
            .notNull()
            .$defaultFn(() => {
                return generateID()
            }),
        blockedById: text("blocked_by_id")
            .references(() => authUser.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            })
            .notNull(),
        blockedId: text("blocked_id")
            .references(() => authUser.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            })
            .notNull(),
    },
    (table) => {
        return {
            idIdx: index("user_blocked_id_idx").on(table.id),
            blockedByIdIdx: index("user_blocked_blocked_by_id_idx").on(
                table.blockedById
            ),
            blockedIdIdx: index("user_blocked_blocked_id_idx").on(
                table.blockedId
            ),
        }
    }
)

export type UserBlocked = typeof userBlocked.$inferSelect
export type NewUserBlocked = typeof userBlocked.$inferInsert
export const insertUserBlockedSchema = createInsertSchema(userBlocked)
export const selectUserBlockedSchema = createSelectSchema(userBlocked)

export const userBlockedRelations = relations(userBlocked, ({ one }) => ({
    blockedBy: one(authUser, {
        fields: [userBlocked.blockedById],
        references: [authUser.id],
        relationName: "blockedBy",
    }),
    blocked: one(authUser, {
        fields: [userBlocked.blockedId],
        references: [authUser.id],
        relationName: "blocked",
    }),
}))
