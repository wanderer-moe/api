import { responseHeaders } from "@/v2/lib/response-headers"
import { getConnection } from "@/v2/db/turso"
import { assetTagAsset, asset, assetTag, authUser } from "@/v2/db/schema"
import { desc, like, sql, eq, and, or } from "drizzle-orm"
import { SplitQueryByCommas } from "@/v2/lib/helpers/split-query-by-commas"

export async function searchForAssets(c: APIContext): Promise<Response> {
    const cacheKey = new Request(c.req.url.toString(), c.req)
    const cache = caches.default
    let response = await cache.match(cacheKey)
    if (response) return response

    const { query, gameQuery, assetCategoryQuery, assetTagQuery } =
        c.req.query()

    // search parameters can include optional search params: query, game, assetCategory, assetTag
    // query?: string => ?query=keqing
    // game?: comma separated list of game names => ?game=genshin-impact,honkai-impact-3rd
    // assetCategory?: comma separated list of asset category names => ?assetCategory=splash-art,character-sheets
    // assetTag?: comma separated list of asset tag names => ?assetTag=no-background,fanmade,official

    const { drizzle } = getConnection(c.env)

    const searchQuery = query ?? null
    const gameList = gameQuery
        ? SplitQueryByCommas(gameQuery.toLowerCase())
        : null
    const assetCategoryList = assetCategoryQuery
        ? SplitQueryByCommas(assetCategoryQuery.toLowerCase())
        : null
    const assetTagList = assetTagQuery
        ? SplitQueryByCommas(assetTagQuery.toLowerCase())
        : // TODO(dromzeh): allow for no tags to be specified
          ["official"]

    const assetTagResponse = drizzle.$with("sq").as(
        drizzle
            .select({
                assetId: assetTagAsset.assetId,
                tags: sql<string[] | null>`array_agg(${assetTag})`.as("tags"),
            })
            .from(assetTagAsset)
            .leftJoin(assetTag, eq(assetTag.id, assetTagAsset.assetTagId))
            .where(or(...assetTagList.map((tag) => eq(assetTag.name, tag))))
            .groupBy(assetTagAsset.assetId)
    )

    const result = await drizzle
        .with(assetTagResponse)
        .select()
        .from(asset)
        .innerJoin(assetTagResponse, eq(assetTagResponse.assetId, asset.id))
        .where(
            and(
                searchQuery && like(asset.name, `%${searchQuery}%`),
                gameList && or(...gameList.map((game) => eq(asset.assetCategoryId, game))),
                assetCategoryList &&
                    or(
                        ...assetCategoryList.map((category) =>
                            eq(asset.assetCategoryId, category)
                        )
                    ),
                eq(asset.status, "approved")
            )
        )
        .leftJoin(authUser, eq(authUser.id, asset.uploadedById))
        .orderBy(desc(asset.uploadedDate))
        .limit(500)

    response = c.json(
        {
            success: true,
            status: "ok",
            query,
            gameQuery,
            assetCategoryQuery,
            assetTagQuery,
            results: result ?? [],
        },
        200,
        responseHeaders
    )

    response.headers.set("Cache-Control", "s-maxage=600")
    await cache.put(cacheKey, response.clone())
    return response
}
