import { tableNames } from "@/v2/db/drizzle"
import { relations } from "drizzle-orm"
import {
    sqliteTable,
    text,
    // uniqueIndex,
    index,
} from "drizzle-orm/sqlite-core"
import { authUser } from "./user"

/*
NOTE: This is mostly security related. 
- Such as when a user forgets their password, they can request a password reset token.
- Or, they can verify their e-mail if they didn't use an OAuth method which returns something like `email_verified`.
*/

export const emailVerificationToken = sqliteTable(
    tableNames.emailVerificationToken,
    {
        id: text("id").unique().notNull(),
        userId: text("user_id")
            .notNull()
            .references(() => authUser.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
        token: text("token").notNull(),
        expiresAt: text("expires_at")
            .notNull()
            .$defaultFn(() => {
                const now = new Date()
                now.setHours(now.getHours() + 12)
                return now.toISOString()
            }),
    },
    (emailVerificationToken) => {
        return {
            userIdx: index("email_verification_token_user_id_idx").on(
                emailVerificationToken.userId
            ),
            tokenIdx: index("email_verification_token_token_idx").on(
                emailVerificationToken.token
            ),
        }
    }
)

export type EmailVerificationToken = typeof emailVerificationToken.$inferSelect
export type NewEmailVerificationToken =
    typeof emailVerificationToken.$inferInsert

export const passwordResetToken = sqliteTable(
    tableNames.passwordResetToken,
    {
        id: text("id").unique().notNull(),
        userId: text("user_id")
            .notNull()
            .references(() => authUser.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
        token: text("token").notNull(),
        expiresAt: text("expires_at")
            .notNull()
            .$defaultFn(() => {
                const now = new Date()
                now.setHours(now.getHours() + 12)
                return now.toISOString()
            }),
    },
    (passwordResetToken) => {
        return {
            userIdx: index("password_reset_token_user_id_idx").on(
                passwordResetToken.userId
            ),
            tokenIdx: index("password_reset_token_token_idx").on(
                passwordResetToken.token
            ),
        }
    }
)

export const emailVerificationTokenRelations = relations(
    emailVerificationToken,
    ({ one }) => ({
        user: one(authUser, {
            fields: [emailVerificationToken.userId],
            references: [authUser.id],
            relationName: "emailverificationtoken_user",
        }),
    })
)

export const passwordResetTokenRelations = relations(
    passwordResetToken,
    ({ one }) => ({
        user: one(authUser, {
            fields: [passwordResetToken.userId],
            references: [authUser.id],
            relationName: "passwordresettoken_user",
        }),
    })
)
