import { DrizzleInstance } from "@/v2/db/turso"
import { game, gameAssetCategory, assetCategory } from "@/v2/db/schema"
import { eq, or, like } from "drizzle-orm"
import { z } from "zod"

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
    async getAssetCategoryById(assetCategoryId: string) {
        const foundAssetCategory = await this.drizzle
            .select()
            .from(assetCategory)
            .leftJoin(
                gameAssetCategory,
                eq(gameAssetCategory.assetCategoryId, assetCategoryId)
            )
            .leftJoin(game, eq(game.id, gameAssetCategory.gameId))
            .where(eq(assetCategory.id, assetCategoryId))

        return foundAssetCategory[0]
    }

    /**
     * Retrieves a list of all asset categories.
     * @returns A promise that resolves to an array of asset categories.
     */
    async listAssetCategories() {
        const assetCategories = await this.drizzle.select().from(assetCategory)

        return assetCategories
    }

    /**
     * Retrieves asset categories with partial name matching.
     * @param assetCategoryName - The partial name to search for within asset categories.
     * @returns A promise that resolves to an array of matching asset categories.
     */
    async getAssetCategoriesByPartialName(assetCategoryName: string) {
        const assetCategories = await this.drizzle
            .select()
            .from(assetCategory)
            .where(or(like(assetCategory.name, `%${assetCategoryName}%`)))

        return assetCategories
    }

    /**
     * Creates a new asset category.
     * @param newAssetCategory - The new asset category to create, adhering to the insertAssetCategorySchema.
     * @returns A promise that resolves to the created asset category.
     */
    async createAssetCategory(
        newAssetCategory: z.infer<typeof insertAssetCategorySchema>
    ) {
        const createdAssetCategory = await this.drizzle
            .insert(assetCategory)
            .values({
                id: newAssetCategory.name,
                name: newAssetCategory.name,
                formattedName: newAssetCategory.name,
                assetCount: 0,
                lastUpdated: new Date().toISOString(),
            })

        return createdAssetCategory
    }

    /**
     * Deletes an asset category by its ID.
     * @param assetCategoryId - The ID of the asset category to delete.
     * @returns A promise that resolves to the deleted asset category.
     */
    async deleteAssetCategory(assetCategoryId: string) {
        const deletedAssetCategory = await this.drizzle
            .delete(assetCategory)
            .where(eq(assetCategory.id, assetCategoryId))
            .returning()

        return deletedAssetCategory[0]
    }

    /**
     * Updates an asset category by its ID.
     * @param assetCategoryId - The ID of the asset category to update.
     * @param newAssetCategory - The updated asset category data, adhering to the insertAssetCategorySchema.
     * @returns A promise that resolves to the updated asset category.
     */
    async updateAssetCategory(
        assetCategoryId: string,
        newAssetCategory: z.infer<typeof insertAssetCategorySchema>
    ) {
        const updatedAssetCategory = await this.drizzle
            .update(assetCategory)
            .set({
                name: newAssetCategory.name,
                formattedName: newAssetCategory.name,
                lastUpdated: new Date().toISOString(),
            })
            .where(eq(assetCategory.id, assetCategoryId))
            .returning()

        return updatedAssetCategory[0]
    }
}
