import { DrizzleInstance } from "@/v2/db/turso"
import { userCollection, userCollectionAsset } from "@/v2/db/schema"
import { eq, like, and } from "drizzle-orm"
import { z } from "zod"

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
    ) {
        const foundCollection = await this.drizzle
            .select()
            .from(userCollection)
            .leftJoin(
                userCollectionAsset,
                eq(userCollectionAsset.collectionId, collectionId)
            )
            .where(
                and(
                    currentUserId
                        ? eq(userCollection.userId, currentUserId)
                        : eq(userCollection.isPublic, 1),
                    eq(userCollection.id, collectionId)
                )
            )

        return foundCollection[0]
    }

    /**
     * Retrieves a list of all collections.
     * @returns A promise that resolves to an array of collections.
     */
    public async listCollections(currentUserId?: string) {
        const collections = await this.drizzle
            .select()
            .from(userCollection)
            .where(
                currentUserId
                    ? eq(userCollection.userId, currentUserId)
                    : eq(userCollection.isPublic, 1)
            )

        return collections
    }

    /**
     * Retrieves collections with partial name matching.
     * @param collectionName - The partial name to search for within collections.
     * @returns A promise that resolves to an array of matching collections.
     */
    public async getCollectionsByPartialName(
        collectionName: string,
        currentUserId?: string
    ) {
        const collections = await this.drizzle
            .select()
            .from(userCollection)
            .where(
                and(
                    currentUserId
                        ? eq(userCollection.userId, currentUserId)
                        : eq(userCollection.isPublic, 1),
                    like(userCollection.name, `%${collectionName}%`)
                )
            )

        return collections
    }

    /**
     * Retrieves public collections for a specific user.
     * @param userId - The ID of the user.
     * @returns The list of public collections associated with the user.
     */
    public async getCollectionsByUserId(
        userId: string,
        currentUserId?: string
    ) {
        const collections = await this.drizzle
            .select()
            .from(userCollection)
            .where(
                and(
                    currentUserId
                        ? eq(userCollection.userId, currentUserId)
                        : eq(userCollection.isPublic, 1),
                    eq(userCollection.userId, userId)
                )
            )

        return collections
    }

    /**
     * Removes an asset from a collection.
     * @param collectionId - The ID of the collection.
     * @param assetId - The ID of the asset to remove.
     */
    public async removeAssetFromCollection(
        collectionId: string,
        assetId: number
    ) {
        await this.drizzle
            .delete(userCollectionAsset)
            .where(
                and(
                    eq(userCollectionAsset.collectionId, collectionId),
                    eq(userCollectionAsset.assetId, assetId)
                )
            )
    }

    /**
     * Deletes a collection by its ID.
     * @param collectionId - The ID of the collection to delete.
     */
    public async deleteCollection(collectionId: string) {
        await this.drizzle
            .delete(userCollection)
            .where(eq(userCollection.id, collectionId))
    }

    /**
     * Adds an asset to a collection.
     * @param collectionId - The ID of the collection.
     * @param assetId - The ID of the asset to add.
     */
    public async addAssetToCollection(collectionId: string, assetId: number) {
        await this.drizzle.insert(userCollectionAsset).values({
            collectionId: collectionId,
            assetId: assetId,
        })
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
    ) {
        const createdCollection = await this.drizzle
            .insert(userCollection)
            .values({
                userId: userId,
                description: collectionSchema.description,
                name: collectionSchema.name,
                isPublic: collectionSchema.isPublic ? 1 : 0,
            })
            .returning({
                collectionId: userCollection.id,
            })

        return createdCollection
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
    ) {
        const updatedCollection = await this.drizzle
            .update(userCollection)
            .set({
                description: collectionSchema.description,
                name: collectionSchema.name,
                isPublic: collectionSchema.isPublic ? 1 : 0,
            })
            .where(eq(userCollection.id, collectionId))
            .returning({
                collectionId: userCollection.id,
            })

        return updatedCollection
    }
}
