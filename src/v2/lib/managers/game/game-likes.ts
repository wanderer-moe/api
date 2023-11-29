import { DrizzleInstance } from "@/v2/db/turso"
import { eq, and } from "drizzle-orm"
import { gameLikes } from "@/v2/db/schema/game/game-likes"

export class GameLikesManager {
    constructor(private drizzle: DrizzleInstance) {}

    /**
     * Likes a game for a user.
     * @param gameId - The ID of the game to like.
     * @param userId - The ID of the user to unlike the game for.
     */
    public async likeGame(gameId: string, userId: string): Promise<void> {
        try {
            await this.drizzle.insert(gameLikes).values({
                gameId,
                likedById: userId,
            })
        } catch (e) {
            console.error(`Error liking game ${gameId} for user ${userId}`, e)
            throw new Error(`Error liking game ${gameId} for user ${userId}`)
        }
    }

    /**
     * Unlikes a game for a user.
     * @param gameId - The ID of the game to unlike.
     * @param userId - The ID of the user to unlike the game for.
     */
    public async unlikeGame(gameId: string, userId: string): Promise<void> {
        try {
            await this.drizzle
                .delete(gameLikes)
                .where(
                    and(
                        eq(gameLikes.gameId, gameId),
                        eq(gameLikes.likedById, userId)
                    )
                )
        } catch (e) {
            console.error(`Error liking game ${gameId} for user ${userId}`, e)
            throw new Error(`Error liking game ${gameId} for user ${userId}`)
        }
    }
}
