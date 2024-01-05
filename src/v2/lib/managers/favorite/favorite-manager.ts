import { userFavorite, userFavoriteAsset } from "@/v2/db/schema"
import { and, eq } from "drizzle-orm"
import { DrizzleInstance } from "@/v2/db/turso"
import type {
    NewUserFavorite,
    NewUserFavoriteAsset,
    UserFavorite,
    UserFavoriteAsset,
} from "@/v2/db/schema"

/**
 * Manages operations related to user favorites.
 */
export class FavoriteManager {
    constructor(private drizzle: DrizzleInstance) {}

    /**
     * Get a user's favorite assets.
     * @param userId - The ID of the user to retrieve favorites for.
     * @param currentUserId - The optional current user's ID.
     * @returns A user's favorite assets.
     */
    public async getUserFavorite(
        userId: string,
        currentUserId?: string
    ): Promise<UserFavorite | null> {
        try {
            const favouriteExists = this.checkIfUserFavoriteExists(userId)

            if (!favouriteExists) {
                await this.createInitialFavorite(userId)
            }

            const [favorite] = await this.drizzle
                .select()
                .from(userFavorite)
                .where(
                    and(
                        currentUserId
                            ? eq(userFavorite.userId, currentUserId)
                            : eq(userFavorite.isPublic, true),
                        eq(userFavorite.userId, userId)
                    )
                )

            return favorite ?? null
        } catch (e) {
            console.error(
                `Error in getUserFavorite for userId ${userId} and currentUserId ${currentUserId}`,
                e
            )
            throw new Error(
                `Error in getUserFavorite for userId ${userId} and currentUserId ${currentUserId}`
            )
        }
    }

    public async checkIfUserFavoriteExists(userId: string): Promise<boolean> {
        try {
            const [favorite] = await this.drizzle
                .select({
                    id: userFavorite.id,
                })
                .from(userFavorite)
                .where(and(eq(userFavorite.userId, userId)))

            return favorite ? true : false
        } catch (e) {
            console.error(
                `Error in checkIfUserFavoriteExists for userId ${userId}`,
                e
            )
            throw new Error(
                `Error in checkIfUserFavoriteExists for userId ${userId}`
            )
        }
    }

    /**
     * Create initial user favorite (1 per user!)
     * @param userId - The ID of the user to create favorites for.
     * @returns A user's favorite item.
     */
    public async createInitialFavorite(
        userId: string
    ): Promise<NewUserFavorite> {
        try {
            const [favorite] = await this.drizzle
                .insert(userFavorite)
                .values({
                    userId: userId,
                })
                .returning()

            return favorite
        } catch (e) {
            console.error(
                `Error in createInitialFavorite for userId ${userId}`,
                e
            )
            throw new Error(
                `Error in createInitialFavorite for userId ${userId}`
            )
        }
    }
    /**
     * Adds an asset to a user's favorites.
     * @param assetId - The ID of the asset to add to favorites.
     * @param userFavoriteId - User's unique favorite ID.
     */
    public async addAssetToFavorites(
        assetId: number,
        userId: string,
        userFavoriteId: string
    ): Promise<NewUserFavoriteAsset> {
        try {
            const favouriteExists = this.checkIfUserFavoriteExists(userId)

            if (!favouriteExists) {
                await this.createInitialFavorite(userId)
            }

            const [favorite] = await this.drizzle
                .insert(userFavoriteAsset)
                .values({
                    userFavoriteId: userFavoriteId,
                    assetId: assetId,
                })
                .returning()

            return favorite
        } catch (e) {
            console.error(
                `Error in addAssetToFavorites for userFavoriteId ${userFavoriteId} and assetId ${assetId}`,
                e
            )
            throw new Error(
                `Error in addAssetToFavorites for userFavoriteId ${userFavoriteId} and assetId ${assetId}`
            )
        }
    }

    /**
     * Removes an asset from a user's favorites.
     * @param assetId - The ID of the asset to remove from favorites.
     * @param userFavoriteId - User's unique favorite ID.
     */
    public async removeAssetFromFavorites(
        assetId: number,
        userId: string,
        userFavoriteId: string
    ): Promise<UserFavoriteAsset | null> {
        try {
            const favouriteExists = this.checkIfUserFavoriteExists(userId)

            if (!favouriteExists) {
                await this.createInitialFavorite(userId)
            }

            const [favorite] = await this.drizzle
                .delete(userFavoriteAsset)
                .where(
                    and(
                        eq(userFavoriteAsset.userFavoriteId, userFavoriteId),
                        eq(userFavoriteAsset.assetId, assetId)
                    )
                )
                .returning()

            return favorite ?? null
        } catch (e) {
            console.error(
                `Error in removeAssetFromFavorites for userFavoriteId ${userFavoriteId} and assetId ${assetId}`,
                e
            )
            throw new Error(
                `Error in removeAssetFromFavorites for userFavoriteId ${userFavoriteId} and assetId ${assetId}`
            )
        }
    }
}
