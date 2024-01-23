import { DrizzleInstance } from "@/v2/db/turso"
import { and, eq } from "drizzle-orm"
import { userCollectionCollaborators } from "@/v2/db/schema/collections/user-collections-collaborators"
import { authUser } from "@/v2/db/schema/user/user"
import type { CollaboratorsRoles } from "@/v2/db/schema/collections/user-collections-collaborators"

export class UserCollectionCollaboratorsManager {
    constructor(private drizzle: DrizzleInstance) {}

    /**
     * Adds a collaborator to a collection.
     * @param collectionId - The ID of the collection to add a collaborator to.
     * @param userId - The ID of the user to add as a collaborator.
     */
    public async addCollaborator(
        collectionId: string,
        userId: string,
        role: CollaboratorsRoles
    ): Promise<void> {
        try {
            await this.drizzle.insert(userCollectionCollaborators).values({
                collectionId: collectionId,
                collaboratorId: userId,
                role: role,
            })
        } catch (e) {
            console.error(
                `Error adding collaborator ${userId} to collection ${collectionId}`,
                e
            )
            throw new Error(
                `Error adding collaborator ${userId} to collection ${collectionId}`
            )
        }
    }

    public async updateCollaboratorRole(
        collectionId: string,
        userId: string,
        role: CollaboratorsRoles
    ): Promise<void> {
        try {
            await this.drizzle
                .update(userCollectionCollaborators)
                .set({
                    role: role,
                })
                .where(
                    and(
                        eq(
                            userCollectionCollaborators.collectionId,
                            collectionId
                        ),
                        eq(userCollectionCollaborators.collaboratorId, userId)
                    )
                )
        } catch (e) {
            console.error(
                `Error updating collaborator ${userId} role in collection ${collectionId}`,
                e
            )
            throw new Error(
                `Error updating collaborator ${userId} role in collection ${collectionId}`
            )
        }
    }

    /**
     * Removes a collaborator from a collection.
     * @param collectionId - The ID of the collection to remove a collaborator from.
     * @param userId - The ID of the user to remove as a collaborator.
     */
    public async removeCollaborator(
        collectionId: string,
        userId: string
    ): Promise<void> {
        try {
            await this.drizzle
                .delete(userCollectionCollaborators)
                .where(
                    and(
                        eq(
                            userCollectionCollaborators.collectionId,
                            collectionId
                        ),
                        eq(userCollectionCollaborators.collaboratorId, userId)
                    )
                )
        } catch (e) {
            console.error(
                `Error removing collaborator ${userId} from collection ${collectionId}`,
                e
            )
            throw new Error(
                `Error removing collaborator ${userId} from collection ${collectionId}`
            )
        }
    }

    /**
     * Gets the collaborators for a collection.
     * @param collectionId - The ID of the collection to get collaborators for.
     */
    public async getCollaborators(collectionId: string) {
        try {
            return await this.drizzle
                .select({
                    userId: authUser.id,
                    username: authUser.username,
                    avatarUrl: authUser.avatarUrl,
                    collectionId: userCollectionCollaborators.collectionId,
                })
                .from(userCollectionCollaborators)
                .fullJoin(
                    authUser,
                    eq(authUser.id, userCollectionCollaborators.collaboratorId)
                )
        } catch (e) {
            console.error(
                `Error getting collaborators for collection ${collectionId}`,
                e
            )
            throw new Error(
                `Error getting collaborators for collection ${collectionId}`
            )
        }
    }
}
