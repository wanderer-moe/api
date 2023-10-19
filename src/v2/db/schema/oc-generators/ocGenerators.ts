import { tableNames } from "@/v2/db/drizzle"
import { relations } from "drizzle-orm"
import {
    sqliteTable,
    text,
    integer,
    // uniqueIndex,
    index,
} from "drizzle-orm/sqlite-core"
import { users } from "../user/user"

/*
NOTE: OC generators are not stored in the database.
- Storing OC generators inside the database may be viable in the future, but for now, it's not necessary.
- OC Generators JSON data is viewable on the /oc-generators/ repository, where it's synced to Cloudflare R2.
*/

export const savedOcGenerators = sqliteTable(
    tableNames.savedOcGenerators,
    {
        id: text("id").primaryKey(),
        userId: text("user_id")
            .notNull()
            .references(() => users.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
        name: text("name").notNull(),
        game: text("game").notNull(),
        dateCreated: text("date_created").notNull(),
        isPublic: integer("is_public").default(0).notNull(),
        content: text("content").notNull(),
        savedColorPalette: text("saved_color_palette"), // array of 5 hex values, completely optional for the user to save
        sakuraUrl: text("sakura_url"),
    },
    (savedOcGenerators) => {
        return {
            savedOcGeneratorsIdx: index("saved_oc_generators_id_idx").on(
                savedOcGenerators.id
            ),
            savedOcGeneratorsUserIdx: index(
                "saved_oc_generators_user_id_idx"
            ).on(savedOcGenerators.userId),
        }
    }
)

export type SavedOcGenerators = typeof savedOcGenerators.$inferSelect
export type NewSavedOcGenerators = typeof savedOcGenerators.$inferInsert

export const savedOcGeneratorsRelations = relations(
    savedOcGenerators,
    ({ one }) => ({
        user: one(users, {
            fields: [savedOcGenerators.userId],
            references: [users.id],
        }),
    })
)
