import { DrizzleInstance } from "@/v2/db/turso"
import { and, eq } from "drizzle-orm"
import { assetLikes } from "@/v2/db/schema/asset/asset-likes"

export class AssetLikesManager {
    constructor(private drizzle: DrizzleInstance) {}

    public async getUsersLikedAssets(userId: string, offset: number = 0) {
        try {
            // return await this.drizzle.select().from(assetLikes).where(eq(assetLikes.likedById, userId)).offset(offset)
            return await this.drizzle.query.assetLikes.findMany({
                where: (assetLikes, { eq }) => eq(assetLikes.likedById, userId),
                with: {
                    asset: {
                        with: {
                            assetTagAsset: {
                                with: {
                                    assetTag: true,
                                },
                            },
                        },
                    },
                },
                offset: offset,
            })
        } catch (e) {
            console.error(`Error getting assets liked by user ${userId}`, e)
            throw new Error(`Error getting assets liked by user ${userId}`)
        }
    }

    public async checkAssetLikeStatus(
        assetId: number,
        userId: string
    ): Promise<boolean> {
        try {
            const [assetLike] = await this.drizzle
                .select({ assetId: assetLikes.assetId })
                .from(assetLikes)
                .where(
                    and(
                        eq(assetLikes.assetId, assetId),
                        eq(assetLikes.likedById, userId)
                    )
                )
                .limit(1)

            return assetLike ? true : false
        } catch (e) {
            console.error(
                `Error checking if asset ${assetId} is liked by user ${userId}`,
                e
            )
            throw new Error(
                `Error checking if asset ${assetId} is liked by user ${userId}`
            )
        }
    }

    /**
     * Likes an asset for a user.
     * @param assetId - The ID of the asset to like.
     * @param userId - The ID of the user to like the asset for.
     */
    public async likeAsset(assetId: number, userId: string) {
        try {
            return await this.drizzle
                .insert(assetLikes)
                .values({
                    assetId,
                    likedById: userId,
                })
                .returning()
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
    public async unlikeAsset(assetId: number, userId: string) {
        try {
            return await this.drizzle
                .delete(assetLikes)
                .where(
                    and(
                        eq(assetLikes.assetId, assetId),
                        eq(assetLikes.likedById, userId)
                    )
                )
                .returning()
        } catch (e) {
            console.error(`Error liking asset ${assetId} for user ${userId}`, e)
            throw new Error(`Error liking asset ${assetId} for user ${userId}`)
        }
    }
}
