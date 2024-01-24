import { DrizzleInstance } from "@/v2/db/turso"
import { and, eq, sql } from "drizzle-orm"
import { userFollowing } from "@/v2/db/schema"
import type { NewUserFollowing, UserFollowing } from "@/v2/db/schema"

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
     * @returns The user follow object representing the follow relationship.
     */
    public async followUser(
        followerId: string,
        followingId: string
    ): Promise<NewUserFollowing> {
        try {
            const [follow] = await this.drizzle
                .insert(userFollowing)
                .values({
                    followerId,
                    followingId,
                    createdAt: new Date().toISOString(),
                })
                .returning()

            return follow
        } catch (e) {
            console.error(
                `Error following user ${followingId} from user ${followerId}`,
                e
            )
            throw new Error(
                `Error following user ${followingId} from user ${followerId}`
            )
        }
    }

    /**
     * Unfollows a user by removing the following relationship between two users.
     *
     * @param followerId - The ID of the user who is unfollowing.
     * @param followingId - The ID of the user being unfollowed.
     * @returns The user networking object representing the removed follow relationship.
     */
    public async unfollowUser(
        followerId: string,
        followingId: string
    ): Promise<UserFollowing> {
        try {
            const [unfollow] = await this.drizzle
                .delete(userFollowing)
                .where(
                    and(
                        eq(userFollowing.followerId, followerId),
                        eq(userFollowing.followingId, followingId)
                    )
                )
                .returning()

            return unfollow
        } catch (e) {
            console.error(
                `Error unfollowing user ${followingId} from user ${followerId}`,
                e
            )
            throw new Error(
                `Error unfollowing user ${followingId} from user ${followerId}`
            )
        }
    }

    public async checkFollowStatus(
        followerId: string,
        followingId: string
    ): Promise<boolean> {
        try {
            const [follow] = await this.drizzle
                .select({ id: userFollowing.followerId })
                .from(userFollowing)
                .where(
                    and(
                        eq(userFollowing.followerId, followerId),
                        eq(userFollowing.followingId, followingId)
                    )
                )
                .limit(1)

            return follow ? true : false
        } catch (e) {
            console.error(
                `Error checking follow status for user ${followingId} from user ${followerId}`,
                e
            )
            throw new Error(
                `Error checking follow status for user ${followingId} from user ${followerId}`
            )
        }
    }

    public async getUserFollowers(userId: string, offset: number = 0) {
        try {
            return await this.drizzle.query.userFollowing.findMany({
                where: (userFollowing, { eq }) =>
                    eq(userFollowing.followingId, userId),
                with: {
                    follower: {
                        columns: {
                            id: true,
                            avatarUrl: true,
                            username: true,
                            isSupporter: true,
                            verified: true,
                            displayName: true,
                        },
                    },
                },
                limit: 100,
                offset: offset,
            })
        } catch (e) {
            console.error(
                `Error getting followers for user ${userId} with offset ${offset}`,
                e
            )
            throw new Error(
                `Error getting followers for user ${userId} with offset ${offset}`
            )
        }
    }

    public async getUserFollowersCount(userId: string) {
        try {
            return await this.drizzle
                .select({
                    value: sql`count(${userFollowing.followerId})`.mapWith(
                        Number
                    ),
                })
                .from(userFollowing)
                .where(eq(userFollowing.followingId, userId))
        } catch (e) {
            console.error(`Error getting followers count for user ${userId}`, e)
            throw new Error(`Error getting followers count for user ${userId}`)
        }
    }

    public async getUserFollowingCount(userId: string) {
        try {
            return await this.drizzle
                .select({
                    value: sql`count(${userFollowing.followingId})`.mapWith(
                        Number
                    ),
                })
                .from(userFollowing)
                .where(eq(userFollowing.followerId, userId))
        } catch (e) {
            console.error(`Error getting following count for user ${userId}`, e)
            throw new Error(`Error getting following count for user ${userId}`)
        }
    }

    public async getUserFollowing(userId: string, offset: number = 0) {
        try {
            return await this.drizzle.query.userFollowing.findMany({
                where: (userFollowing, { eq }) =>
                    eq(userFollowing.followerId, userId),
                with: {
                    following: {
                        columns: {
                            id: true,
                            avatarUrl: true,
                            username: true,
                            isSupporter: true,
                            verified: true,
                            displayName: true,
                        },
                    },
                },
                limit: 100,
                offset: offset,
            })
        } catch (e) {
            console.error(
                `Error getting following for user ${userId} with offset ${offset}`,
                e
            )
            throw new Error(
                `Error getting following for user ${userId} with offset ${offset}`
            )
        }
    }
}
