import { tableNames } from "@/v2/db/drizzle"
import { relations } from "drizzle-orm"
import {
    sqliteTable,
    text,
    integer,
    // uniqueIndex,
    index,
} from "drizzle-orm/sqlite-core"
import { users } from "./user"

/*
NOTE: This is mostly security related. 
- Such as when a user forgets their password, they can request a password reset token.
- Or, they can verify their e-mail if they didn't use an OAuth method which returns something like `email_verified`.
*/

export const emailVerificationToken = sqliteTable(
    tableNames.emailVerificationToken,
    {
        id: text("id").primaryKey(),
        userId: text("user_id")
            .notNull()
            .references(() => users.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
        token: text("token").notNull(),
        expiresAt: integer("expires_at").notNull(),
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
        id: text("id").primaryKey(),
        userId: text("user_id")
            .notNull()
            .references(() => users.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
        token: text("token").notNull(),
        expiresAt: integer("expires_at").notNull(),
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
        user: one(users, {
            fields: [emailVerificationToken.userId],
            references: [users.id],
        }),
    })
)

export const passwordResetTokenRelations = relations(
    passwordResetToken,
    ({ one }) => ({
        user: one(users, {
            fields: [passwordResetToken.userId],
            references: [users.id],
        }),
    })
)
