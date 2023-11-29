import { DrizzleInstance } from "@/v2/db/turso"
import { eq, and } from "drizzle-orm"
import { assetTagLikes } from "@/v2/db/schema/tags/asset-tags-likes"

export class AssetTagLikesManager {
    constructor(private drizzle: DrizzleInstance) {}

    /**
     * Likes a game for a user.
     * @param assetTagId - The ID of the tag to like.
     * @param userId - The ID of the user to like the tag for.
     */
    public async likeTag(assetTagId: string, userId: string): Promise<void> {
        try {
            await this.drizzle.insert(assetTagLikes).values({
                assetTagId,
                likedById: userId,
            })
        } catch (e) {
            console.error(
                `Error liking tag ${assetTagId} for user ${userId}`,
                e
            )
            throw new Error(`Error liking tag ${assetTagId} for user ${userId}`)
        }
    }

    /**
     * Likes a tag for a user.
     * @param assetTagId - The ID of the tag to unlike.
     * @param userId - The ID of the user to unlike the tag for.
     */
    public async unlikeTag(assetTagId: string, userId: string): Promise<void> {
        try {
            await this.drizzle
                .delete(assetTagLikes)
                .where(
                    and(
                        eq(assetTagLikes.assetTagId, assetTagId),
                        eq(assetTagLikes.likedById, userId)
                    )
                )
        } catch (e) {
            console.error(
                `Error liking tag ${assetTagId} for user ${userId}`,
                e
            )
            throw new Error(`Error liking tag ${assetTagId} for user ${userId}`)
        }
    }
}
