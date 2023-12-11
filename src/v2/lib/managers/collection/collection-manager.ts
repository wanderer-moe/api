import { DrizzleInstance } from "@/v2/db/turso"
import { userCollection, userCollectionAsset } from "@/v2/db/schema"
import { and, eq, like } from "drizzle-orm"
import { z } from "zod"
import type {
    NewUserCollection,
    NewUserCollectionAsset,
    UserCollection,
    UserCollectionAsset,
} from "@/v2/db/schema"

const insertCollectionSchema = z.object({
    name: z.string(),
    description: z.string(),
    isPublic: z.boolean(),
})

/**
 * Manages operations related to collections.
 */
export class CollectionManager {
    constructor(private drizzle: DrizzleInstance) {}

    /**
     * Retrieves a collection by its ID.
     * @param collectionId - The unique ID of the collection to retrieve.
     * @returns A promise that resolves to the retrieved collection.
     */
    public async getCollectionById(
        collectionId: string,
        currentUserId?: string
    ): Promise<UserCollection | null> {
        try {
            const [foundCollection] = await this.drizzle
                .select()
                .from(userCollection)
                .where(
                    and(
                        currentUserId
                            ? eq(userCollection.userId, currentUserId)
                            : eq(userCollection.isPublic, true),
                        eq(userCollection.id, collectionId)
                    )
                )

            return foundCollection ?? null
        } catch (e) {
            console.error(
                `Error in getCollectionById for collectionId ${collectionId} and currentUserId ${currentUserId}`,
                e
            )
            throw new Error(
                `Error in getCollectionById for collectionId ${collectionId} and currentUserId ${currentUserId}`
            )
        }
    }

    /**
     * Retrieves a list of all collections.
     * @returns A promise that resolves to an array of collections.
     */
    public async listCollections(
        currentUserId?: string
    ): Promise<UserCollection[] | null> {
        try {
            const collections = await this.drizzle
                .select()
                .from(userCollection)
                .where(
                    currentUserId
                        ? eq(userCollection.userId, currentUserId)
                        : eq(userCollection.isPublic, true)
                )

            return collections ?? null
        } catch (e) {
            console.error(
                `Error in listCollections for currentUserId ${currentUserId}`,
                e
            )
            throw new Error(
                `Error in listCollections for currentUserId ${currentUserId}`
            )
        }
    }

    /**
     * Retrieves collections with partial name matching.
     * @param collectionName - The partial name to search for within collections.
     * @returns A promise that resolves to an array of matching collections.
     */
    public async getCollectionsByPartialName(
        collectionName: string,
        currentUserId?: string
    ): Promise<UserCollection[] | null> {
        try {
            const collections = await this.drizzle
                .select()
                .from(userCollection)
                .where(
                    and(
                        currentUserId
                            ? eq(userCollection.userId, currentUserId)
                            : eq(userCollection.isPublic, true),
                        like(userCollection.name, `%${collectionName}%`)
                    )
                )

            return collections ?? null
        } catch (e) {
            console.error(
                `Error in getCollectionsByPartialName for collectionName ${collectionName} and currentUserId ${currentUserId}`,
                e
            )
            throw new Error(
                `Error in getCollectionsByPartialName for collectionName ${collectionName} and currentUserId ${currentUserId}`
            )
        }
    }
    /**
     * Retrieves public collections for a specific user.
     * @param userId - The ID of the user.
     * @returns The list of public collections associated with the user.
     */
    public async getCollectionsByUserId(
        userId: string,
        currentUserId?: string
    ): Promise<UserCollection[] | null> {
        try {
            const collections = await this.drizzle
                .select()
                .from(userCollection)
                .where(
                    and(
                        currentUserId
                            ? eq(userCollection.userId, currentUserId)
                            : eq(userCollection.isPublic, true),
                        eq(userCollection.userId, userId)
                    )
                )

            return collections ?? null
        } catch (e) {
            console.error(
                `Error in getCollectionsByUserId for userId ${userId} and currentUserId ${currentUserId}`,
                e
            )
            throw new Error(
                `Error in getCollectionsByUserId for userId ${userId} and currentUserId ${currentUserId}`
            )
        }
    }

    /**
     * Removes an asset from a collection.
     * @param collectionId - The ID of the collection.
     * @param assetId - The ID of the asset to remove.
     */
    public async removeAssetFromCollection(
        collectionId: string,
        assetId: number
    ): Promise<UserCollectionAsset | null> {
        try {
            const [removedAsset] = await this.drizzle
                .delete(userCollectionAsset)
                .where(
                    and(
                        eq(userCollectionAsset.collectionId, collectionId),
                        eq(userCollectionAsset.assetId, assetId)
                    )
                )
                .returning()

            return removedAsset ?? null
        } catch (e) {
            console.error(
                `Error in removeAssetFromCollection for collectionId ${collectionId} and assetId ${assetId}`,
                e
            )
            throw new Error(
                `Error in removeAssetFromCollection for collectionId ${collectionId} and assetId ${assetId}`
            )
        }
    }

    /**
     * Deletes a collection by its ID.
     * @param collectionId - The ID of the collection to delete.
     */
    public async deleteCollection(
        collectionId: string
    ): Promise<UserCollection> {
        try {
            const [deletedCollection] = await this.drizzle
                .delete(userCollection)
                .where(eq(userCollection.id, collectionId))
                .returning()

            return deletedCollection
        } catch (e) {
            console.error(
                `Error in deleteCollection for collectionId ${collectionId}`,
                e
            )
            throw new Error(
                `Error in deleteCollection for collectionId ${collectionId}`
            )
        }
    }

    /**
     * Adds an asset to a collection.
     * @param collectionId - The ID of the collection.
     * @param assetId - The ID of the asset to add.
     */
    public async addAssetToCollection(
        collectionId: string,
        assetId: number
    ): Promise<NewUserCollectionAsset> {
        try {
            const [addedAsset] = await this.drizzle
                .insert(userCollectionAsset)
                .values({
                    collectionId: collectionId,
                    assetId: assetId,
                })
                .returning()

            return addedAsset
        } catch (e) {
            console.error(
                `Error in addAssetToCollection for collectionId ${collectionId} and assetId ${assetId}`,
                e
            )
            throw new Error(
                `Error in addAssetToCollection for collectionId ${collectionId} and assetId ${assetId}`
            )
        }
    }

    /**
     * Creates a new collection.
     * @param userId - The ID of the user creating the collection.
     * @param collectionSchema - The schema for the new collection.
     * @returns The created collection.
     */
    public async createCollection(
        userId: string,
        collectionSchema: z.infer<typeof insertCollectionSchema>
    ): Promise<NewUserCollection> {
        try {
            const [createdCollection] = await this.drizzle
                .insert(userCollection)
                .values({
                    userId: userId,
                    description: collectionSchema.description,
                    name: collectionSchema.name,
                    isPublic: collectionSchema.isPublic,
                })
                .returning()

            return createdCollection
        } catch (e) {
            console.error(
                `Error in createCollection for userId ${userId} and collectionSchema ${collectionSchema}`,
                e
            )
            throw new Error(
                `Error in createCollection for userId ${userId} and collectionSchema ${collectionSchema}`
            )
        }
    }

    /**
     * Updates an existing collection.
     *
     * @param collectionId - The ID of the collection to update.
     * @param collectionSchema - The updated schema for the collection.
     * @returns The updated collection.
     */
    public async updateCollection(
        collectionId: string,
        collectionSchema: z.infer<typeof insertCollectionSchema>
    ): Promise<UserCollection> {
        try {
            const [updatedCollection] = await this.drizzle
                .update(userCollection)
                .set({
                    description: collectionSchema.description,
                    name: collectionSchema.name,
                    isPublic: collectionSchema.isPublic,
                })
                .where(eq(userCollection.id, collectionId))
                .returning()

            return updatedCollection
        } catch (e) {
            console.error(
                `Error in updateCollection for collectionId ${collectionId} and collectionSchema ${collectionSchema}`,
                e
            )
            throw new Error(
                `Error in updateCollection for collectionId ${collectionId} and collectionSchema ${collectionSchema}`
            )
        }
    }
}
