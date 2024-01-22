import { DrizzleInstance } from "@/v2/db/turso"
import { asset, assetTag, assetTagAsset } from "@/v2/db/schema"
import { eq } from "drizzle-orm"
import { R2Bucket } from "@cloudflare/workers-types"
import { SplitQueryByCommas } from "../../helpers/split-query-by-commas"
import { z } from "zod"
import type { Asset, NewAsset } from "@/v2/db/schema"
import type { assetSearchAllFilter } from "@/v2/routes/asset/search/all/schema"
import { uploadAssetSchema } from "@/v2/routes/asset/upload/schema"

export class AssetManager {
    constructor(private drizzle: DrizzleInstance) {}

    public async getAssetById(assetId: number) {
        try {
            return await this.drizzle.query.asset.findFirst({
                where: (asset, { eq }) => eq(asset.id, assetId),
                with: {
                    assetTagAsset: {
                        with: {
                            assetTag: true,
                        },
                    },
                    authUser: {
                        columns: {
                            id: true,
                            avatarUrl: true,
                            displayName: true,
                            username: true,
                            usernameColour: true,
                            pronouns: true,
                            verified: true,
                            bio: true,
                            dateJoined: true,
                            isSupporter: true,
                            roleFlags: true,
                        },
                    },
                    game: true,
                    assetCategory: true,
                },
            })
        } catch (e) {
            console.error(`Error getting asset by ID ${assetId}`, e)
            throw new Error(`Error getting asset by ID ${assetId}`)
        }
    }

    public async deleteAssetById(assetId: number) {
        try {
            return await this.drizzle
                .delete(asset)
                .where(eq(asset.id, assetId))
                .returning()
        } catch (e) {
            console.error(`Error deleting asset by ID ${assetId}`, e)
            throw new Error(`Error deleting asset by ID ${assetId}`)
        }
    }

    public async updateAssetById(
        assetId: number,
        update: z.infer<typeof uploadAssetSchema>
    ) {
        try {
            return await this.drizzle
                .update(asset)
                .set({
                    name: update.name,
                    assetCategoryId: update.assetCategoryId,
                    gameId: update.gameId,
                    assetIsSuggestive: Boolean(update.assetIsSuggestive),
                })
                .where(eq(asset.id, assetId))
                .returning()
        } catch (e) {
            console.error(`Error updating asset by ID ${assetId}`, e)
            throw new Error(`Error updating asset by ID ${assetId}`)
        }
    }

    /**
     * Retrieves a list of all assets.
     * @returns A promise that resolves to an array of assets.
     */
    public async listAssets() {
        try {
            return await this.drizzle.select().from(asset)
        } catch (e) {
            console.error("Error listing assets", e)
            throw new Error("Error listing assets")
        }
    }

    /**
     * Searches for assets based on optional query filters.
     * @param query - An object containing optional search parameters.
     * @returns A promise that resolves to an array of matching assets.
     */
    public async searchAssets(query: assetSearchAllFilter) {
        try {
            const { name, game, category, tags, offset } = query

            const gameList = game
                ? SplitQueryByCommas(game.toLowerCase())
                : null
            const categoryList = category
                ? SplitQueryByCommas(category.toLowerCase())
                : null
            const searchQuery = name ?? null
            const tagList = tags ? SplitQueryByCommas(tags.toLowerCase()) : null

            // TODO(dromzeh): this is really ugly imo, worried about performance a little
            // when writing with raw sql, it makes joins really annoying
            // i've seen people seperate this into two queries (one for the tags, one for the assets) then merge them together
            // but i don't really want to do that lol - fine for now but should come back to this later :^)
            const assets = await this.drizzle.query.asset.findMany({
                where: (asset, { and, or, like, eq, sql }) =>
                    and(
                        tagList && tagList.length > 0
                            ? or(
                                  ...tagList.map(
                                      (t) =>
                                          sql`EXISTS (SELECT 1 FROM assetTagAsset WHERE assetTagAsset.asset_id = ${asset.id} AND assetTagAsset.asset_tag_id = ${t})`
                                  )
                              )
                            : undefined,
                        searchQuery
                            ? like(asset.name, `%${searchQuery}%`)
                            : undefined,
                        gameList
                            ? or(
                                  ...gameList.map((game) =>
                                      eq(asset.gameId, game)
                                  )
                              )
                            : undefined,
                        categoryList
                            ? or(
                                  ...categoryList.map((category) =>
                                      eq(asset.assetCategoryId, category)
                                  )
                              )
                            : undefined,
                        eq(asset.status, "approved")
                    ),
                limit: 100,
                offset: offset ? parseInt(offset) : 0,
                with: {
                    assetTagAsset: {
                        with: {
                            assetTag: true,
                        },
                    },
                },
            })
            return assets
        } catch (e) {
            console.error("Error searching assets", e)
            throw new Error("Error searching assets")
        }
    }

    /**
     * Creates a new asset.
     * @param userId - The ID of the user creating the asset.
     * @param newAsset - The new asset data, adhering to the UploadAssetSchema.
     * @param bucket - The Cloudflare R2Bucket for asset storage.
     * @param file - The File object representing the asset to be uploaded.
     * @returns A promise that resolves to the created asset.
     */
    public async createAsset(
        userId: string,
        userNickname: string,
        newAsset: z.infer<typeof uploadAssetSchema>,
        bucket: R2Bucket, // TODO(dromzeh): come back to this later :^)
        file: File
    ): Promise<NewAsset> {
        try {
            const { key } = await bucket.put(
                `/assets/${newAsset.gameId}/${newAsset.assetCategoryId}/${newAsset.name}.png`,
                file
            )
            // TODO(dromzeh): correct file size, width, and height

            const returnedNewAsset: Asset = await this.drizzle.transaction(
                async (trx) => {
                    const [createdAsset] = await trx
                        .insert(asset)
                        .values({
                            name: newAsset.name,
                            extension: "png",
                            gameId: newAsset.gameId,
                            assetCategoryId: newAsset.assetCategoryId,
                            url: key,
                            uploadedByName: userNickname,
                            uploadedById: userId,
                            status: "pending",
                            fileSize: 0,
                            width: 0,
                            height: 0,
                            assetIsSuggestive: Boolean(
                                newAsset.assetIsSuggestive
                            ),
                        })
                        .returning()

                    const tags = SplitQueryByCommas(newAsset.tags) ?? []

                    if (tags.length === 0) return createdAsset

                    for (const tag of tags) {
                        const foundTag = await trx
                            .select({
                                id: assetTag.id,
                            })
                            .from(assetTag)
                            .where(eq(assetTag.name, tag))

                        if (foundTag) {
                            await trx.insert(assetTagAsset).values({
                                assetId: createdAsset.id,
                                assetTagId: tag,
                            })
                        }
                    }

                    return createdAsset
                }
            )

            return returnedNewAsset
        } catch (e) {
            console.error("Error creating asset", e)
            throw new Error("Error creating asset")
        }
    }
}
