import { DrizzleInstance } from "@/v2/db/turso"
import { authUser } from "@/v2/db/schema"
import { eq, or, like } from "drizzle-orm"

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
        const user = await this.drizzle
            .select()
            .from(authUser)
            .where(eq(authUser.id, userId))

        return user[0]
    }

    /**
     * Retrieves a user by their username.
     *
     * @param username - The username of the user to retrieve.
     * @returns The user object or undefined if not found.
     */
    public async getUserByUsername(username: string) {
        const user = await this.drizzle
            .select()
            .from(authUser)
            .where(eq(authUser.username, username))

        return user[0]
    }

    /**
     * Retrieves users by partially matching their usernames.
     *
     * @param username - The partial username to search for.
     * @returns An array of user objects matching the search criteria, limited to 25 results.
     */
    public async getUsersByUsername(username: string) {
        const users = await this.drizzle
            .select()
            .from(authUser)
            .where(or(like(authUser.username, `%${username}%`)))
            .limit(25)

        return users
    }
}
