import { DrizzleInstance } from "@/v2/db/turso"
import { authUser } from "@/v2/db/schema"
import { eq, like, or } from "drizzle-orm"

/**
 * Manages user search and retrieval operations.
 */
export class UserSearchManager {
    constructor(private drizzle: DrizzleInstance) {}

    /**
     * Retrieves a user by their user ID.
     *
     * @param userId - The ID of the user to retrieve.
     * @returns The user object or undefined if not found.
     */
    public async getUserById(userId: string) {
        try {
            const [user] = await this.drizzle
                .select({
                    id: authUser.id,
                    avatarUrl: authUser.avatarUrl,
                    displayName: authUser.displayName,
                    username: authUser.username,
                    usernameColour: authUser.usernameColour,
                    pronouns: authUser.pronouns,
                    verified: authUser.verified,
                    bio: authUser.bio,
                    dateJoined: authUser.dateJoined,
                    isSupporter: authUser.isSupporter,
                    roleFlags: authUser.roleFlags,
                })
                .from(authUser)
                .where(eq(authUser.id, userId))

            return user ?? null
        } catch (e) {
            console.error(`Error getting user by ID ${userId}`, e)
            throw new Error(`Error getting user by ID ${userId}`)
        }
    }

    // public async getUserByEmail(email: string) {
    //     try {
    //         const [user] = await this.drizzle
    //             .select()
    //             .from(authUser)
    //             .where(eq(authUser.email, email))

    //         return user ?? null
    //     } catch (e) {
    //         console.error(`Error getting user by email ${email}`, e)
    //         throw new Error(`Error getting user by email ${email}`)
    //     }
    // }

    /**
     * Retrieves a user by their username.
     *
     * @param username - The username of the user to retrieve.
     * @returns The user object or undefined if not found.
     */
    public async getUserByUsername(username: string) {
        try {
            const [user] = await this.drizzle
                .select({
                    id: authUser.id,
                    avatarUrl: authUser.avatarUrl,
                    displayName: authUser.displayName,
                    username: authUser.username,
                    usernameColour: authUser.usernameColour,
                    pronouns: authUser.pronouns,
                    verified: authUser.verified,
                    bio: authUser.bio,
                    dateJoined: authUser.dateJoined,
                    isSupporter: authUser.isSupporter,
                    roleFlags: authUser.roleFlags,
                })
                .from(authUser)
                .where(eq(authUser.username, username))

            return user ?? null
        } catch (e) {
            console.error(`Error getting user by username ${username}`, e)
            throw new Error(`Error getting user by username ${username}`)
        }
    }

    /**
     * Retrieves users by partially matching their usernames.
     *
     * @param username - The partial username to search for.
     * @returns An array of user objects matching the search criteria, limited to 25 results.
     */
    public async getUsersByUsername(username: string) {
        try {
            const users = await this.drizzle
                .select({
                    id: authUser.id,
                    avatarUrl: authUser.avatarUrl,
                    displayName: authUser.displayName,
                    username: authUser.username,
                    usernameColour: authUser.usernameColour,
                    pronouns: authUser.pronouns,
                    verified: authUser.verified,
                    bio: authUser.bio,
                    dateJoined: authUser.dateJoined,
                    isSupporter: authUser.isSupporter,
                    roleFlags: authUser.roleFlags,
                })
                .from(authUser)
                .where(or(like(authUser.username, `%${username}%`)))
                .limit(25)

            return users ?? null
        } catch (e) {
            console.error(`Error getting users by username ${username}`, e)
            throw new Error(`Error getting users by username ${username}`)
        }
    }
}
