import { DrizzleInstance } from "@/v2/db/turso"
import { game, gameAssetCategory, assetCategory } from "@/v2/db/schema"
import { eq, or, like } from "drizzle-orm"

/**
 * Manages operations related to games.
 */
export class GameManager {
    constructor(private drizzle: DrizzleInstance) {}

    /**
     * Retrieves a game by its ID.
     * @param gameId - The unique ID of the game to retrieve.
     * @returns A promise that resolves to the retrieved game and its asset categories.
     */
    async getGameById(gameId: string) {
        const foundGame = await this.drizzle
            .select()
            .from(game)
            .leftJoin(gameAssetCategory, eq(gameAssetCategory.gameId, gameId))
            .leftJoin(
                assetCategory,
                eq(assetCategory.id, gameAssetCategory.assetCategoryId)
            )
            .where(eq(game.id, gameId))

        return foundGame[0]
    }

    /**
     * Retrieves games with partial name matching.
     * @param gameName - The partial name to search for within game names.
     * @returns A promise that resolves to an array of matching games.
     */
    async getGamesByPartialName(gameName: string) {
        const games = await this.drizzle
            .select()
            .from(game)
            .where(or(like(game.name, `%${gameName}%`)))

        return games
    }
}
