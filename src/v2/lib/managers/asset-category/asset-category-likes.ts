import { DrizzleInstance } from "@/v2/db/turso"
import { and, eq } from "drizzle-orm"
import { assetCategoryLikes } from "@/v2/db/schema/categories/asset-categories-likes"

export class AssetCategoryLikesManager {
    constructor(private drizzle: DrizzleInstance) {}

    /**
     * Likes a category for a user.
     * @param assetCategoryId - The ID of the collection to like.
     * @param userId - The ID of the user to like the collection for.
     */
    public async likeAssetCategory(
        assetCategoryId: string,
        userId: string
    ): Promise<void> {
        try {
            await this.drizzle.insert(assetCategoryLikes).values({
                assetCategoryId,
                likedById: userId,
            })
        } catch (e) {
            console.error(
                `Error liking category ${assetCategoryId} for user ${userId}`,
                e
            )
            throw new Error(
                `Error liking category ${assetCategoryId} for user ${userId}`
            )
        }
    }

    /**
     * Unlikes a category for a user.
     * @param assetCategoryId - The ID of the category to unlike.
     * @param userId - The ID of the user to unlike the category for.
     */
    public async unlikeAssetCategory(
        assetCategoryId: string,
        userId: string
    ): Promise<void> {
        try {
            await this.drizzle
                .delete(assetCategoryLikes)
                .where(
                    and(
                        eq(assetCategoryLikes.assetCategoryId, assetCategoryId),
                        eq(assetCategoryLikes.likedById, userId)
                    )
                )
        } catch (e) {
            console.error(
                `Error liking category ${assetCategoryId} for user ${userId}`,
                e
            )
            throw new Error(
                `Error liking category ${assetCategoryId} for user ${userId}`
            )
        }
    }
}
