import { DrizzleInstance } from "@/v2/db/turso"
import { game } from "@/v2/db/schema"
import { eq, like, or } from "drizzle-orm"
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
        try {
            const [foundGame] = await this.drizzle
                .select()
                .from(game)
                .where(eq(game.id, gameId))

            return foundGame ?? null
        } catch (e) {
            console.error(`Error getting game by ID ${gameId}`, e)
            throw new Error(`Error getting game by ID ${gameId}`)
        }
    }

    public async doesGameExist(gameId: string): Promise<boolean> {
        try {
            const [foundGame] = await this.drizzle
                .select({ id: game.id })
                .from(game)
                .where(eq(game.id, gameId))

            return foundGame ? true : false
        } catch (e) {
            console.error(`Error checking if game exists ${gameId}`, e)
            throw new Error(`Error checking if game exists ${gameId}`)
        }
    }

    /**
     * Retrieves a game by its name.
     * @param gameName - The name of the game to retrieve.
     * @returns A promise that resolves to the retrieved game and its asset categories.
     */
    public async getGameByName(gameName: string): Promise<Game | null> {
        try {
            const [foundGame] = await this.drizzle
                .select()
                .from(game)
                .where(eq(game.name, gameName))

            return foundGame ?? null
        } catch (e) {
            console.error(`Error getting game by name ${gameName}`, e)
            throw new Error(`Error getting game by name ${gameName}`)
        }
    }

    /**
     * Retrieves games with partial name matching.
     * @param gameName - The partial name to search for within game names.
     * @returns A promise that resolves to an array of matching games.
     */
    public async getGamesByPartialName(
        gameName: string
    ): Promise<Game[] | Game | null> {
        try {
            const games = await this.drizzle
                .select()
                .from(game)
                .where(or(like(game.name, `%${gameName}%`)))

            return games ?? null
        } catch (e) {
            console.error("Error getting games by partial name", e)
            throw new Error("Error getting games by partial name")
        }
    }

    /**
     * Retrieves a list of all games.
     * @returns A promise that resolves to an array of games.
     */

    public async listGames(): Promise<Game[] | Game | null> {
        try {
            const games = await this.drizzle.select().from(game)
            return games ?? null
        } catch (e) {
            console.error("Error listing games", e)
            throw new Error("Error listing games")
        }
    }

    public async createGame(
        name: string,
        formattedName: string,
        possibleSuggestiveContent: number
    ): Promise<Game> {
        try {
            const [newGame] = await this.drizzle
                .insert(game)
                .values({
                    id: name,
                    name,
                    formattedName,
                    possibleSuggestiveContent,
                    lastUpdated: new Date().toISOString(),
                })
                .returning()

            return newGame
        } catch (e) {
            console.error("Error creating game", e)
            throw new Error("Error creating game")
        }
    }

    public async deleteGame(gameId: string): Promise<void> {
        try {
            await this.drizzle.delete(game).where(eq(game.id, gameId))
        } catch (e) {
            console.error(`Error deleting game ${gameId}`, e)
            throw new Error(`Error deleting game ${gameId}`)
        }
    }

    public async updateGame(
        gameId: string,
        name: string,
        formattedName: string,
        possibleSuggestiveContent: number
    ): Promise<Game> {
        try {
            const [updatedGame] = await this.drizzle
                .update(game)
                .set({
                    name,
                    formattedName,
                    possibleSuggestiveContent,
                    lastUpdated: new Date().toISOString(),
                })
                .where(eq(game.id, gameId))
                .returning()

            return updatedGame
        } catch (e) {
            console.error(`Error updating game ${gameId}`, e)
            throw new Error(`Error updating game ${gameId}`)
        }
    }
}
