import { DrizzleInstance } from "@/v2/db/turso"
import { gameAssetCategory } from "@/v2/db/schema"
import { eq, and } from "drizzle-orm"
import type { GameAssetCategory } from "@/v2/db/schema"

/**
 * Manages operations related to game asset categories.
 */
export class GameAssetCategoryManager {
    constructor(private drizzle: DrizzleInstance) {}

    /**
     * Links an asset category to a game.
     * @param assetCategoryId - The ID of the asset category to link.
     * @param gameId - The ID of the game to which the asset category will be linked.
     * @returns A promise that resolves to the created game asset category.
     */
    public async linkAssetCategoryToGame(
        assetCategoryId: string,
        gameId: string
    ): Promise<GameAssetCategory> {
        try {
            const [createdGameAssetCategory] = await this.drizzle
                .insert(gameAssetCategory)
                .values({
                    assetCategoryId,
                    gameId,
                })
                .returning()

            return createdGameAssetCategory
        } catch (e) {
            console.error(
                `Error linking asset category ${assetCategoryId} to game ${gameId}`,
                e
            )
            throw new Error(
                `Error linking asset category ${assetCategoryId} to game ${gameId}`
            )
        }
    }

    /**
     * Unlinks an asset category from a game.
     * @param assetCategoryId - The ID of the asset category to unlink.
     * @param gameId - The ID of the game from which the asset category will be unlinked.
     * @returns A promise that resolves to the deleted game asset category.
     */
    public async unlinkAssetCategoryFromGame(
        assetCategoryId: string,
        gameId: string
    ): Promise<GameAssetCategory> {
        try {
            const [deletedGameAssetCategory] = await this.drizzle
                .delete(gameAssetCategory)
                .where(
                    and(
                        eq(gameAssetCategory.assetCategoryId, assetCategoryId),
                        eq(gameAssetCategory.gameId, gameId)
                    )
                )
                .returning()

            return deletedGameAssetCategory
        } catch (e) {
            console.error(
                `Error unlinking asset category ${assetCategoryId} from game ${gameId}`,
                e
            )
            throw new Error(
                `Error unlinking asset category ${assetCategoryId} from game ${gameId}`
            )
        }
    }
}
