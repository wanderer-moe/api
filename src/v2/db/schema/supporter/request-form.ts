import { tableNames } from "@/v2/db/drizzle"
import { relations } from "drizzle-orm"
import {
    sqliteTable,
    text,
    // uniqueIndex,
    index,
} from "drizzle-orm/sqlite-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { generateID } from "@/v2/lib/oslo"
import { authUser } from "../user/user"

type requestArea = "asset" | "game" | "site"

export const requestForm = sqliteTable(
    tableNames.requestForm,
    {
        id: text("id")
            .unique()
            .notNull()
            .$defaultFn(() => {
                return generateID()
            }),
        userId: text("user_id")
            .notNull()
            .references(() => authUser.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
        area: text("type").notNull().$type<requestArea>(),
        title: text("title").notNull(),
        description: text("description").notNull(),
    },
    (requestForm) => {
        return {
            requestFormUserIdx: index("request_form_user_id_idx").on(
                requestForm.userId
            ),
        }
    }
)

export type RequestForm = typeof requestForm.$inferSelect
export type NewRequestForm = typeof requestForm.$inferInsert
export const insertRequestFormSchema = createInsertSchema(requestForm)
export const selectRequestFormSchema = createSelectSchema(requestForm)

export const requestFormRelations = relations(requestForm, ({ one, many }) => ({
    user: one(authUser, {
        fields: [requestForm.userId],
        references: [authUser.id],
        relationName: "request_form_user",
    }),
    upvotes: many(requestFormUpvotes),
}))

export const requestFormUpvotes = sqliteTable(
    tableNames.requestFormUpvotes,
    {
        id: text("id")
            .unique()
            .notNull()
            .$defaultFn(() => {
                return generateID()
            }),
        requestFormId: text("request_form_id")
            .notNull()
            .references(() => requestForm.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
        userId: text("user_id")
            .notNull()
            .references(() => authUser.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
    },
    (requestFormUpvotes) => {
        return {
            requestFormUpvotesIdx: index("request_form_upvotes_idx").on(
                requestFormUpvotes.requestFormId,
                requestFormUpvotes.userId
            ),
        }
    }
)

export type RequestFormUpvotes = typeof requestFormUpvotes.$inferSelect
export type NewRequestFormUpvotes = typeof requestFormUpvotes.$inferInsert
export const insertRequestFormUpvotesSchema =
    createInsertSchema(requestFormUpvotes)
export const selectRequestFormUpvotesSchema =
    createSelectSchema(requestFormUpvotes)

export const requestFormUpvotesRelations = relations(
    requestFormUpvotes,
    ({ one }) => ({
        user: one(authUser, {
            fields: [requestFormUpvotes.userId],
            references: [authUser.id],
            relationName: "request_form_upvotes_user",
        }),
        requestForm: one(requestForm, {
            fields: [requestFormUpvotes.requestFormId],
            references: [requestForm.id],
            relationName: "request_form_upvotes_request_form",
        }),
    })
)
