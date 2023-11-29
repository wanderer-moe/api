import { tableNames } from "@/v2/db/drizzle"
import { relations } from "drizzle-orm"
import { sqliteTable, text, index } from "drizzle-orm/sqlite-core"
import { authUser } from "../user/user"
import { game } from "./game"

export const gameLikes = sqliteTable(
    tableNames.gameLikes,
    {
        gameId: text("asset_id")
            .notNull()
            .references(() => game.id),
        likedById: text("liked_by_id")
            .notNull()
            .references(() => authUser.id),
        createdAt: text("created_at")
            .notNull()
            .$defaultFn(() => {
                return new Date().toISOString()
            }),
    },
    (gameLikes) => {
        return {
            gameIdx: index("gamelikes_game_idx").on(gameLikes.gameId),
            likedByIdx: index("gamelikes_likedby_idx").on(gameLikes.likedById),
        }
    }
)

export type GameLikes = typeof gameLikes.$inferSelect
export type NewGameLikes = typeof gameLikes.$inferInsert

export const gameLikesRelations = relations(gameLikes, ({ one }) => ({
    game: one(game, {
        fields: [gameLikes.gameId],
        references: [game.id],
        relationName: "gamelikes_liked_game",
    }),
    likedBy: one(authUser, {
        fields: [gameLikes.likedById],
        references: [authUser.id],
        relationName: "gamelikes_liked_by",
    }),
}))
