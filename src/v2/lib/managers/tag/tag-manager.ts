import { DrizzleInstance } from "@/v2/db/turso"
import { assetTag } from "@/v2/db/schema"
import { eq, like, or } from "drizzle-orm"
import { z } from "zod"
import type { AssetTag, NewAssetTag } from "@/v2/db/schema"

/**
 * Represents the schema for inserting a new asset tag.
 */
const insertAssetTagSchema = z.object({
    name: z.string(),
    formattedName: z.string(),
})

/**
 * Manages operations related to asset tags.
 */
export class TagManager {
    constructor(private drizzle: DrizzleInstance) {}

    /**
     * Retrieves an asset tag by its ID.
     * @param tagId - The unique ID of the tag to retrieve.
     * @returns A promise that resolves to the retrieved asset tag.
     */
    public async getTagById(tagId: string): Promise<AssetTag | null> {
        try {
            const [foundTag] = await this.drizzle
                .select()
                .from(assetTag)
                .where(eq(assetTag.id, tagId))

            return foundTag ?? null
        } catch (e) {
            throw new Error(`Error getting tag by ID ${tagId}`)
        }
    }

    /**
     * Retrieves a list of all asset tags.
     * @returns A promise that resolves to an array of asset tags.
     */
    public async listTags(): Promise<AssetTag[] | null> {
        try {
            const tags = await this.drizzle.select().from(assetTag)
            return tags ?? null
        } catch (e) {
            throw new Error("Error listing tags")
        }
    }

    /**
     * Retrieves asset tags with partial name matching.
     * @param tagName - The partial name to search for within asset tags.
     * @returns A promise that resolves to an array of matching asset tags.
     */
    public async getTagsByPartialName(
        tagName: string
    ): Promise<AssetTag[] | AssetTag | null> {
        try {
            const tags = await this.drizzle
                .select()
                .from(assetTag)
                .where(or(like(assetTag.name, `%${tagName}%`)))

            return tags ?? null
        } catch (e) {
            throw new Error("Error getting tags by partial name")
        }
    }

    /**
     * Creates a new asset tag.
     * @param newTag - The new asset tag to create, adhering to the insertAssetTagSchema.
     * @returns A promise that resolves to the created asset tag.
     */
    public async createTag(
        newTag: z.infer<typeof insertAssetTagSchema>
    ): Promise<NewAssetTag> {
        try {
            const [createdTag] = await this.drizzle
                .insert(assetTag)
                .values({
                    id: newTag.name,
                    name: newTag.name,
                    formattedName: newTag.name,
                    assetCount: 0,
                    lastUpdated: new Date().toISOString(),
                })
                .returning()

            return createdTag
        } catch (e) {
            throw new Error("Error creating tag")
        }
    }
}
