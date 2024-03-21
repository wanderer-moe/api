import { tableNames } from "@/v2/db/drizzle"
import { relations } from "drizzle-orm"
import {
    sqliteTable,
    text,
    integer,
    // uniqueIndex,
    index,
} from "drizzle-orm/sqlite-core"
import { asset } from "../asset/asset"
import { gameAssetCategory } from "../categories/asset-categories"
// import { gameLikes } from "./game-likes"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"

/*
NOTE: Game relation is easy to understand and self-explanatory.
- A game can have many assets and many game asset categories.
*/

export const game = sqliteTable(
    tableNames.game,
    {
        id: text("id").primaryKey().notNull(), // e.g genshin-impact, honkai-impact-3rd
        name: text("name").notNull().unique(), // e.g genshin-impact, honkai-impact-3rd
        formattedName: text("formatted_name").notNull(), // e.g Genshin Impact, Honkai Impact 3rd
        possibleSuggestiveContent: integer("possible_suggestive_content", {
            mode: "boolean",
        })
            .default(false)
            .notNull(),
        lastUpdated: text("last_updated")
            .notNull()
            .$defaultFn(() => {
                return new Date().toISOString()
            }),
    },
    (game) => {
        return {
            gameIdx: index("game_id_idx").on(game.id),
            nameIdx: index("game_name_idx").on(game.name),
        }
    }
)

export type Game = typeof game.$inferSelect
export type NewGame = typeof game.$inferInsert
export const insertGameSchema = createInsertSchema(game)
export const selectGameSchema = createSelectSchema(game)

export const gameRelations = relations(game, ({ many }) => ({
    asset: many(asset),
    gameAssetCategory: many(gameAssetCategory),
    // gameLikes: many(gameLikes),
}))
