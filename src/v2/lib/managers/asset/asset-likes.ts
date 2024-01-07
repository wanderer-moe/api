import { DrizzleInstance } from "@/v2/db/turso"
import { and, eq } from "drizzle-orm"
import { assetLikes } from "@/v2/db/schema/asset/asset-likes"

export class AssetLikesManager {
    constructor(private drizzle: DrizzleInstance) {}

    /**
     * Likes an asset for a user.
     * @param assetId - The ID of the asset to like.
     * @param userId - The ID of the user to like the asset for.
     */
    public async likeAsset(assetId: string, userId: string): Promise<void> {
        try {
            await this.drizzle.insert(assetLikes).values({
                assetId,
                likedById: userId,
            })
        } catch (e) {
            console.error(`Error liking asset ${assetId} for user ${userId}`, e)
            throw new Error(`Error liking asset ${assetId} for user ${userId}`)
        }
    }

    /**
     * Unlikes an asset for a user.
     * @param assetId - The ID of the asset to like.
     * @param userId - The ID of the user to like the asset for.
     */
    public async unlikeAsset(assetId: string, userId: string): Promise<void> {
        try {
            await this.drizzle
                .delete(assetLikes)
                .where(
                    and(
                        eq(assetLikes.assetId, assetId),
                        eq(assetLikes.likedById, userId)
                    )
                )
        } catch (e) {
            console.error(`Error liking asset ${assetId} for user ${userId}`, e)
            throw new Error(`Error liking asset ${assetId} for user ${userId}`)
        }
    }
}