import { DrizzleInstance } from "@/v2/db/turso"
import { authUser } from "@/v2/db/schema"
import { eq, or, like } from "drizzle-orm"
import type { User } from "@/v2/db/schema"

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
    public async getUserById(userId: string): Promise<User | null> {
        try {
            const [user] = await this.drizzle
                .select()
                .from(authUser)
                .where(eq(authUser.id, userId))

            return user ?? null
        } catch (e) {
            console.error(`Error getting user by ID ${userId}`, e)
            throw new Error(`Error getting user by ID ${userId}`)
        }
    }

    /**
     * Retrieves a user by their username.
     *
     * @param username - The username of the user to retrieve.
     * @returns The user object or undefined if not found.
     */
    public async getUserByUsername(username: string): Promise<User | null> {
        try {
            const [user] = await this.drizzle
                .select()
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
    public async getUsersByUsername(username: string): Promise<User[] | User> {
        try {
            const users = await this.drizzle
                .select()
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
