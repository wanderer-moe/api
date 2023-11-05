import { tableNames } from "@/v2/db/drizzle"
import { relations } from "drizzle-orm"
import { sqliteTable, text, index } from "drizzle-orm/sqlite-core"
import { authUser } from "./user"

/*
NOTE: This file will be expanded on in the future, but for now it's just for Discord.
- This is used to link an account to ID but also can be set by initial Discord OAuth.
*/

export const socialsConnection = sqliteTable(
    tableNames.socialsConnection,
    {
        id: text("id").unique().notNull(),
        userId: text("user_id")
            .notNull()
            .references(() => authUser.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
        discordId: text("discord_id"),
    },
    (socialsConnection) => {
        return {
            userIdx: index("socials_connection_user_id_idx").on(
                socialsConnection.userId
            ),
            discordIdIdx: index("socials_connection_discord_id_idx").on(
                socialsConnection.discordId
            ),
        }
    }
)

export type SocialsConnection = typeof socialsConnection.$inferSelect
export type NewSocialsConnection = typeof socialsConnection.$inferInsert

export const socialsConnectionRelations = relations(
    socialsConnection,
    ({ one }) => ({
        user: one(authUser, {
            fields: [socialsConnection.userId],
            references: [authUser.id],
        }),
    })
)
