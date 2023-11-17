import { DrizzleInstance } from "@/v2/db/turso"
import { game } from "@/v2/db/schema"
import { eq, or, like } from "drizzle-orm"
import type { Game } from "@/v2/db/schema"

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
    public async getGameById(gameId: string): Promise<Game | null> {
        let foundGame: Game | null = null

        try {
            ;[foundGame] = await this.drizzle
                .select()
                .from(game)
                .where(eq(game.id, gameId))
        } catch (e) {
            console.error(`Error getting game by ID ${gameId}`, e)
            throw new Error(`Error getting game by ID ${gameId}`)
        }

        return foundGame
    }

    /**
     * Retrieves games with partial name matching.
     * @param gameName - The partial name to search for within game names.
     * @returns A promise that resolves to an array of matching games.
     */
    public async getGamesByPartialName(
        gameName: string
    ): Promise<Game[] | Game | null> {
        let games: Game[] | null = null

        try {
            games = await this.drizzle
                .select()
                .from(game)
                .where(or(like(game.name, `%${gameName}%`)))
        } catch (e) {
            console.error("Error getting games by partial name", e)
            throw new Error("Error getting games by partial name")
        }

        return games ?? null
    }

    /**
     * Retrieves a list of all games.
     * @returns A promise that resolves to an array of games.
     */

    public async listGames(): Promise<Game[]> {
        let games: Game[] | null = null

        try {
            games = await this.drizzle.select().from(game)
        } catch (e) {
            console.error("Error listing games", e)
            throw new Error("Error listing games")
        }

        return games ?? []
    }
}
