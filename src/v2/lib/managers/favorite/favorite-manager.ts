import { userFavourite, userFavouriteAsset } from "@/v2/db/schema"
import { and, eq } from "drizzle-orm"
import { DrizzleInstance } from "@/v2/db/turso"
import type {
    NewUserFavourite,
    NewUserFavouriteAsset,
    UserFavourite,
    UserFavouriteAsset,
} from "@/v2/db/schema"

/**
 * Manages operations related to user favourites.
 */
export class FavoriteManager {
    constructor(private drizzle: DrizzleInstance) {}

    /**
     * Get a user's favourite assets.
     * @param userId - The ID of the user to retrieve favourites for.
     * @param currentUserId - The optional current user's ID.
     * @returns A user's favourite assets.
     */
    public async getUserFavourite(
        userId: string,
        currentUserId?: string
    ): Promise<UserFavourite | null> {
        try {
            const favouriteExists = this.checkIfUserFavouriteExists(userId)

            if (!favouriteExists) {
                await this.createInitialFavorite(userId)
            }

            const [favourite] = await this.drizzle
                .select()
                .from(userFavourite)
                .where(
                    and(
                        currentUserId
                            ? eq(userFavourite.userId, currentUserId)
                            : eq(userFavourite.isPublic, true),
                        eq(userFavourite.userId, userId)
                    )
                )

            return favourite ?? null
        } catch (e) {
            console.error(
                `Error in getUserFavourite for userId ${userId} and currentUserId ${currentUserId}`,
                e
            )
            throw new Error(
                `Error in getUserFavourite for userId ${userId} and currentUserId ${currentUserId}`
            )
        }
    }

    public async checkIfUserFavouriteExists(userId: string): Promise<boolean> {
        try {
            const [favourite] = await this.drizzle
                .select({
                    id: userFavourite.id,
                })
                .from(userFavourite)
                .where(and(eq(userFavourite.userId, userId)))

            return favourite ? true : false
        } catch (e) {
            console.error(
                `Error in checkIfUserFavouriteExists for userId ${userId}`,
                e
            )
            throw new Error(
                `Error in checkIfUserFavouriteExists for userId ${userId}`
            )
        }
    }

    /**
     * Create initial user favourite (1 per user!)
     * @param userId - The ID of the user to create favourites for.
     * @returns A user's favourite item.
     */
    public async createInitialFavorite(
        userId: string
    ): Promise<NewUserFavourite> {
        try {
            const [favourite] = await this.drizzle
                .insert(userFavourite)
                .values({
                    userId: userId,
                })
                .returning()

            return favourite
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
     * Adds an asset to a user's favourites.
     * @param assetId - The ID of the asset to add to favourites.
     * @param userFavouriteId - User's unique favourite ID.
     */
    public async addAssetToFavorites(
        assetId: number,
        userId: string,
        userFavouriteId: string
    ): Promise<NewUserFavouriteAsset> {
        try {
            const favouriteExists = this.checkIfUserFavouriteExists(userId)

            if (!favouriteExists) {
                await this.createInitialFavorite(userId)
            }

            const [favourite] = await this.drizzle
                .insert(userFavouriteAsset)
                .values({
                    userFavouriteId: userFavouriteId,
                    assetId: assetId,
                })
                .returning()

            return favourite
        } catch (e) {
            console.error(
                `Error in addAssetToFavorites for userFavouriteId ${userFavouriteId} and assetId ${assetId}`,
                e
            )
            throw new Error(
                `Error in addAssetToFavorites for userFavouriteId ${userFavouriteId} and assetId ${assetId}`
            )
        }
    }

    /**
     * Removes an asset from a user's favourites.
     * @param assetId - The ID of the asset to remove from favourites.
     * @param userFavouriteId - User's unique favourite ID.
     */
    public async removeAssetFromFavorites(
        assetId: number,
        userId: string,
        userFavouriteId: string
    ): Promise<UserFavouriteAsset | null> {
        try {
            const favouriteExists = this.checkIfUserFavouriteExists(userId)

            if (!favouriteExists) {
                await this.createInitialFavorite(userId)
            }

            const [favourite] = await this.drizzle
                .delete(userFavouriteAsset)
                .where(
                    and(
                        eq(userFavouriteAsset.userFavouriteId, userFavouriteId),
                        eq(userFavouriteAsset.assetId, assetId)
                    )
                )
                .returning()

            return favourite ?? null
        } catch (e) {
            console.error(
                `Error in removeAssetFromFavorites for userFavouriteId ${userFavouriteId} and assetId ${assetId}`,
                e
            )
            throw new Error(
                `Error in removeAssetFromFavorites for userFavouriteId ${userFavouriteId} and assetId ${assetId}`
            )
        }
    }
}
