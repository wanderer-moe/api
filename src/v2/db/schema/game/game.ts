import { tableNames } from "@/v2/db/drizzle"
import { relations } from "drizzle-orm"
import {
    sqliteTable,
    text,
    integer,
    // uniqueIndex,
    index,
} from "drizzle-orm/sqlite-core"
import { assets } from "../asset/asset"
import { gameAssetCategory } from "../asset/asset-categories"

/*
NOTE: Game relation is easy to understand and self-explanatory.
- A game can have many assets and many game asset categories.
*/

export const game = sqliteTable(
    tableNames.game,
    {
        id: text("id").primaryKey(),
        name: text("name").notNull(), // e.g genshin-impact, honkai-impact-3rd
        formattedName: text("formatted_name").notNull(), // e.g Genshin Impact, Honkai Impact 3rd
        assetCount: integer("asset_count").default(0),
        possibleSuggestiveContent: integer("possible_suggestive_content")
            .default(0)
            .notNull(),
        lastUpdated: integer("last_updated").notNull(),
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

export const gameRelations = relations(game, ({ many }) => ({
    assets: many(assets),
    gameAssetCategory: many(gameAssetCategory),
}))
