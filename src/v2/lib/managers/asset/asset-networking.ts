import { DrizzleInstance } from "@/v2/db/turso"
import { eq, and } from "drizzle-orm"
import { assetNetworking } from "@/v2/db/schema/asset/asset-networking"

export class AssetNetworkingManager {
    constructor(private drizzle: DrizzleInstance) {}

    /**
     * Favorites an asset for a user.
     * @param assetId - The ID of the asset to favorite.
     * @param userId - The ID of the user to favorite the asset for.
     */
    public async favoriteAsset(assetId: string, userId: string): Promise<void> {
        try {
            await this.drizzle.insert(assetNetworking).values({
                assetId,
                likedById: userId,
            })
        } catch (e) {
            console.error(
                `Error favoriting asset ${assetId} for user ${userId}`,
                e
            )
            throw new Error(
                `Error favoriting asset ${assetId} for user ${userId}`
            )
        }
    }

    /**
     * Unfavorites an asset for a user.
     * @param assetId - The ID of the asset to unfavorite.
     * @param userId - The ID of the user to unfavorite the asset for.
     */
    public async unfavoriteAsset(
        assetId: string,
        userId: string
    ): Promise<void> {
        try {
            await this.drizzle
                .delete(assetNetworking)
                .where(
                    and(
                        eq(assetNetworking.assetId, assetId),
                        eq(assetNetworking.likedById, userId)
                    )
                )
        } catch (e) {
            console.error(
                `Error unfavoriting asset ${assetId} for user ${userId}`,
                e
            )
            throw new Error(
                `Error unfavoriting asset ${assetId} for user ${userId}`
            )
        }
    }
}
