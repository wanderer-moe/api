import { DrizzleInstance } from "@/v2/db/turso"
import { and, eq } from "drizzle-orm"
import { userNetworking } from "@/v2/db/schema"

/**
 * Manages user follow and unfollow operations.
 */
export class UserFollowManager {
    constructor(private drizzle: DrizzleInstance) {}

    /**
     * Follows a user by creating a following relationship between two users.
     *
     * @param followerId - The ID of the user who is following.
     * @param followingId - The ID of the user being followed.
     * @returns The user networking object representing the follow relationship.
     */
    public async followUser(followerId: string, followingId: string) {
        const networking = await this.drizzle
            .insert(userNetworking)
            .values({
                followerId,
                followingId,
                createdAt: new Date().toISOString(),
            })
            .returning()

        return networking[0]
    }

    /**
     * Unfollows a user by removing the following relationship between two users.
     *
     * @param followerId - The ID of the user who is unfollowing.
     * @param followingId - The ID of the user being unfollowed.
     * @returns The user networking object representing the removed follow relationship.
     */
    public async unfollowUser(followerId: string, followingId: string) {
        const networking = await this.drizzle
            .delete(userNetworking)
            .where(
                and(
                    eq(userNetworking.followerId, followerId),
                    eq(userNetworking.followingId, followingId)
                )
            )
            .returning()

        return networking[0]
    }

    /**
     * Retrieves the followers of a user by their user ID.
     *
     * @param userId - The ID of the user for whom to retrieve followers.
     * @returns An array of user networking objects representing followers.
     */
    public async getFollowers(userId: string) {
        const followers = await this.drizzle
            .select()
            .from(userNetworking)
            .where(eq(userNetworking.followingId, userId))

        return followers
    }
}
