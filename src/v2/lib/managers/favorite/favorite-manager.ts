import { userFavorite, userFavoriteAsset } from "@/v2/db/schema"
import { eq, and } from "drizzle-orm"
import { DrizzleInstance } from "@/v2/db/turso"

/**
 * Manages operations related to user favorites.
 */
export class FavoriteManager {
    constructor(private drizzle: DrizzleInstance) {}

    /**
     * Get a user's favorite assets.
     * @param userId - The ID of the user to retrieve favorites for.
     * @param currentUserId - The optional current user's ID.
     * @returns A user's favorite item.
     */
    public async getUserFavorite(userId: string, currentUserId?: string) {
        const favorite = await this.drizzle
            .select()
            .from(userFavorite)
            .leftJoin(
                userFavoriteAsset,
                eq(userFavoriteAsset.userFavoriteId, userFavorite.id)
            )
            .where(
                and(
                    currentUserId
                        ? eq(userFavorite.userId, currentUserId)
                        : eq(userFavorite.isPublic, 1),
                    eq(userFavorite.userId, userId)
                )
            )

        return favorite[0]
    }

    /**
     * Create initial user favorite (1 per user!)
     * @param userId - The ID of the user to create favorites for.
     * @returns A user's favorite item.
     */
    public async createInitialFavorite(userId: string) {
        const favorite = await this.drizzle
            .insert(userFavorite)
            .values({
                userId: userId,
            })
            .returning()

        return favorite[0]
    }

    /**
     * Adds an asset to a user's favorites.
     * @param assetId - The ID of the asset to add to favorites.
     * @param userFavoriteId - User's unique favorite ID.
     */
    public async addAssetToFavorites(assetId: number, userFavoriteId: string) {
        const favorite = await this.drizzle
            .insert(userFavoriteAsset)
            .values({
                userFavoriteId: userFavoriteId,
                assetId: assetId,
            })
            .returning()

        return favorite
    }

    /**
     * Removes an asset from a user's favorites.
     * @param assetId - The ID of the asset to remove from favorites.
     * @param userFavoriteId - User's unique favorite ID.
     */
    public async removeAssetFromFavorites(
        assetId: number,
        userFavoriteId: string
    ) {
        const favorite = await this.drizzle
            .delete(userFavoriteAsset)
            .where(
                and(
                    eq(userFavoriteAsset.userFavoriteId, userFavoriteId),
                    eq(userFavoriteAsset.assetId, assetId)
                )
            )
            .returning()

        return favorite
    }
}
