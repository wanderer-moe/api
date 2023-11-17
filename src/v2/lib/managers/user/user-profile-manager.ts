import { DrizzleInstance } from "@/v2/db/turso"
import { authUser } from "@/v2/db/schema"
import type { User } from "@/v2/db/schema"
import { R2Bucket } from "@cloudflare/workers-types"
import { eq } from "drizzle-orm"
import { z } from "zod"

/**
 * Represents the schema for user attributes.
 */
const UserAttributesSchema = z
    .object({
        displayName: z.string(),
        username: z.string(),
        bio: z.string(),
        pronouns: z.string(),
    })
    .partial()

/**
 * Manages user profiles and related operations.
 */
export class UserProfileManager {
    constructor(private drizzle: DrizzleInstance) {}

    /**
     * Updates the attributes of a user's profile.
     *
     * @param userId - The ID of the user to update.
     * @param attributes - The new user attributes.
     * @returns The updated user object.
     * @throws Error if the provided attributes are invalid.
     */
    public async updateUserAttributes(
        userId: string,
        attributes: z.infer<typeof UserAttributesSchema>
    ): Promise<User> {
        try {
            const validAttributes = UserAttributesSchema.safeParse(attributes)
            if (!validAttributes.success)
                throw new Error(`Invalid attributes provided`)

            const [user] = await this.drizzle
                .update(authUser)
                .set(attributes)
                .where(eq(authUser.id, userId))
                .returning()

            return user
        } catch (e) {
            console.error(`Error updating user attributes`, e)
            throw new Error(`Error updating user attributes`)
        }
    }

    /**
     * Updates the user's profile picture.
     *
     * @param userId - The ID of the user to update.
     * @param bucket - The R2Bucket where the picture will be stored.
     * @param file - The new profile picture file.
     * @returns The URL of the updated profile picture.
     */
    public async updateProfilePicture(
        userId: string,
        bucket: R2Bucket,
        file: File
    ): Promise<string> {
        try {
            const { key } = await bucket.put(`/avatars/${userId}.png`, file)

            const [user] = await this.drizzle
                .update(authUser)
                .set({ avatarUrl: key })
                .where(eq(authUser.id, userId))
                .returning()

            return user.avatarUrl
        } catch (e) {
            console.error(`Error updating profile picture`, e)
            throw new Error(`Error updating profile picture`)
        }
    }

    /**
     * Updates the user's profile banner image.
     *
     * @param userId - The ID of the user to update.
     * @param bucket - The R2Bucket where the banner image will be stored.
     * @param file - The new banner image file.
     * @returns The URL of the updated banner image.
     */
    public async updateBanner(
        userId: string,
        bucket: R2Bucket,
        file: File
    ): Promise<string> {
        try {
            const { key } = await bucket.put(`/banners/${userId}.png`, file)

            const [user] = await this.drizzle
                .update(authUser)
                .set({ bannerUrl: key })
                .where(eq(authUser.id, userId))
                .returning()

            return user.bannerUrl
        } catch (e) {
            console.error(`Error updating banner`, e)
            throw new Error(`Error updating banner`)
        }
    }

    /**
     * Resets the user's profile picture to null.
     *
     * @param userId - The ID of the user to update.
     * @param bucket - The R2Bucket where the picture is stored.
     * @returns The URL of the reset profile picture (null).
     */
    public async resetProfilePicture(
        userId: string,
        bucket: R2Bucket
    ): Promise<string> {
        try {
            await bucket.delete(`/avatars/${userId}.png`)

            const [user] = await this.drizzle
                .update(authUser)
                .set({ avatarUrl: null })
                .where(eq(authUser.id, userId))
                .returning()

            return user.avatarUrl
        } catch (e) {
            console.error(`Error resetting profile picture`, e)
            throw new Error(`Error resetting profile picture`)
        }
    }

    /**
     * Resets the user's profile banner image to null.
     *
     * @param userId - The ID of the user to update.
     * @param bucket - The R2Bucket where the banner image is stored.
     * @returns The URL of the reset banner image (null).
     */
    public async resetBanner(userId: string, bucket: R2Bucket) {
        try {
            await bucket.delete(`/banners/${userId}.png`)

            const [user] = await this.drizzle
                .update(authUser)
                .set({ bannerUrl: null })
                .where(eq(authUser.id, userId))
                .returning()

            return user.bannerUrl
        } catch (e) {
            console.error(`Error resetting banner`, e)
            throw new Error(`Error resetting banner`)
        }
    }
}
