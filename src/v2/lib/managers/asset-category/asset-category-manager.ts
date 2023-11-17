import { DrizzleInstance } from "@/v2/db/turso"
import { assetCategory } from "@/v2/db/schema"
import { eq, or, like } from "drizzle-orm"
import { z } from "zod"
import type { AssetCategory, NewAssetCategory } from "@/v2/db/schema"

/**
 * Represents the schema for inserting a new asset category.
 */
const insertAssetCategorySchema = z.object({
    name: z.string(),
    formattedName: z.string(),
})

/**
 * Manages operations related to asset categories.
 */
export class AssetCategoryManager {
    constructor(private drizzle: DrizzleInstance) {}

    /**
     * Retrieves an asset category by its ID.
     * @param assetCategoryId - The unique ID of the asset category to retrieve.
     * @returns A promise that resolves to the retrieved asset category.
     */
    public async getAssetCategoryById(
        assetCategoryId: string
    ): Promise<AssetCategory | null> {
        try {
            const [foundAssetCategory] = await this.drizzle
                .select()
                .from(assetCategory)
                .where(eq(assetCategory.id, assetCategoryId))

            return foundAssetCategory ?? null
        } catch (e) {
            console.error(
                `Error getting asset category by ID ${assetCategoryId}`,
                e
            )
            throw new Error(
                `Error getting asset category by ID ${assetCategoryId}`
            )
        }
    }

    /**
     * Retrieves a list of all asset categories.
     * @returns A promise that resolves to an array of asset categories.
     */
    public async listAssetCategories(): Promise<AssetCategory[]> {
        try {
            const assetCategories = await this.drizzle
                .select()
                .from(assetCategory)

            return assetCategories
        } catch (e) {
            console.error("Error listing asset categories", e)
            throw new Error("Error listing asset categories")
        }
    }

    /**
     * Retrieves asset categories with partial name matching.
     * @param assetCategoryName - The partial name to search for within asset categories.
     * @returns A promise that resolves to an array of matching asset categories.
     */
    public async getAssetCategoriesByPartialName(
        assetCategoryName: string
    ): Promise<AssetCategory[] | AssetCategory | null> {
        try {
            const assetCategories = await this.drizzle
                .select()
                .from(assetCategory)
                .where(or(like(assetCategory.name, `%${assetCategoryName}%`)))

            return assetCategories
        } catch (e) {
            console.error("Error getting asset categories by partial name", e)
            throw new Error("Error getting asset categories by partial name")
        }
    }

    /**
     * Creates a new asset category.
     * @param newAssetCategory - The new asset category to create, adhering to the insertAssetCategorySchema.
     * @returns A promise that resolves to the created asset category.
     */
    public async createAssetCategory(
        newAssetCategory: z.infer<typeof insertAssetCategorySchema>
    ): Promise<NewAssetCategory> {
        try {
            const [createdAssetCategory] = await this.drizzle
                .insert(assetCategory)
                .values({
                    id: newAssetCategory.name,
                    name: newAssetCategory.name,
                    formattedName: newAssetCategory.name,
                    assetCount: 0,
                    lastUpdated: new Date().toISOString(),
                })
                .returning()

            return createdAssetCategory
        } catch (e) {
            console.error("Error creating asset category", e)
            throw new Error("Error creating asset category")
        }
    }

    /**
     * Deletes an asset category by its ID.
     * @param assetCategoryId - The ID of the asset category to delete.
     * @returns A promise that resolves to the deleted asset category.
     */
    public async deleteAssetCategory(
        assetCategoryId: string
    ): Promise<AssetCategory> {
        try {
            const [deletedAssetCategory] = await this.drizzle
                .delete(assetCategory)
                .where(eq(assetCategory.id, assetCategoryId))
                .returning()

            return deletedAssetCategory
        } catch (e) {
            console.error(
                `Error deleting asset category by ID ${assetCategoryId}`,
                e
            )
            throw new Error(
                `Error deleting asset category by ID ${assetCategoryId}`
            )
        }
    }

    /**
     * Updates an asset category by its ID.
     * @param assetCategoryId - The ID of the asset category to update.
     * @param newAssetCategory - The updated asset category data, adhering to the insertAssetCategorySchema.
     * @returns A promise that resolves to the updated asset category.
     */
    public async updateAssetCategory(
        assetCategoryId: string,
        newAssetCategory: z.infer<typeof insertAssetCategorySchema>
    ): Promise<AssetCategory> {
        try {
            const [updatedAssetCategory] = await this.drizzle
                .update(assetCategory)
                .set({
                    name: newAssetCategory.name,
                    formattedName: newAssetCategory.name,
                    lastUpdated: new Date().toISOString(),
                })
                .where(eq(assetCategory.id, assetCategoryId))
                .returning()

            return updatedAssetCategory
        } catch (e) {
            console.error(
                `Error updating asset category by ID ${assetCategoryId}`,
                e
            )
            throw new Error(
                `Error updating asset category by ID ${assetCategoryId}`
            )
        }
    }
}
