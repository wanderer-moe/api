import { DrizzleInstance } from "@/v2/db/turso"
import { eq, and } from "drizzle-orm"
import { userCollectionLikes } from "@/v2/db/schema/collections/user-collection-likes"

export class UserCollectionLikesManager {
    constructor(private drizzle: DrizzleInstance) {}

    /**
     * Likes a collection for a user.
     * @param collectionId - The ID of the collection to like.
     * @param userId - The ID of the user to like the collection for.
     */
    public async likeCollection(
        collectionId: string,
        userId: string
    ): Promise<void> {
        try {
            await this.drizzle.insert(userCollectionLikes).values({
                collectionId,
                likedById: userId,
            })
        } catch (e) {
            console.error(
                `Error liking game ${collectionId} for user ${userId}`,
                e
            )
            throw new Error(
                `Error liking game ${collectionId} for user ${userId}`
            )
        }
    }

    /**
     * Unlikes a collection for a user.
     * @param collectionId - The ID of the collection to unlike.
     * @param userId - The ID of the user to unlike the collection for.
     */
    public async unlikeCollection(
        collectionId: string,
        userId: string
    ): Promise<void> {
        try {
            await this.drizzle
                .delete(userCollectionLikes)
                .where(
                    and(
                        eq(userCollectionLikes.collectionId, collectionId),
                        eq(userCollectionLikes.likedById, userId)
                    )
                )
        } catch (e) {
            console.error(
                `Error liking game ${collectionId} for user ${userId}`,
                e
            )
            throw new Error(
                `Error liking game ${collectionId} for user ${userId}`
            )
        }
    }
}
