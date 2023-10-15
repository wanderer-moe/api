import { responseHeaders } from "@/v2/lib/responseHeaders"
import { getConnection } from "@/v2/db/turso"
import { assetTagsAssets, assets, assetTags, users } from "@/v2/db/schema"
import { desc, like, sql, eq, and, or } from "drizzle-orm"
import { SplitQueryByCommas } from "@/v2/lib/helpers/splitQueryByCommas"

export async function searchForAssets(c: APIContext): Promise<Response> {
    const cacheKey = new Request(c.req.url.toString(), c.req)
    const cache = caches.default
    let response = await cache.match(cacheKey)
    if (response) return response

    const { query, gameQuery, assetCategoryQuery, assetTagsQuery } =
        c.req.query()

    // search parameters can include optional search params: query, game, assetCategory, assetTags
    // query?: string => ?query=keqing
    // game?: comma separated list of game names => ?game=genshin-impact,honkai-impact-3rd
    // assetCategory?: comma separated list of asset category names => ?assetCategory=splash-art,character-sheets
    // assetTags?: comma separated list of asset tag names => ?assetTags=no-background,fanmade,official

    const drizzle = getConnection(c.env).drizzle

    const searchQuery = query ?? null
    const gameList = gameQuery
        ? SplitQueryByCommas(gameQuery.toLowerCase())
        : null
    const assetCategoryList = assetCategoryQuery
        ? SplitQueryByCommas(assetCategoryQuery.toLowerCase())
        : null
    const assetTagsList = assetTagsQuery
        ? SplitQueryByCommas(assetTagsQuery.toLowerCase())
        : // TODO(dromzeh): allow for no tags to be specified
          ["official"]

    const assetTagResponse = drizzle.$with("sq").as(
        drizzle
            .select({
                assetId: assetTagsAssets.assetId,
                tags: sql<string[] | null>`array_agg(${assetTags})`.as("tags"),
            })
            .from(assetTagsAssets)
            .leftJoin(assetTags, eq(assetTags.id, assetTagsAssets.assetTagId))
            .where(or(...assetTagsList.map((tag) => eq(assetTags.name, tag))))
            .groupBy(assetTagsAssets.assetId)
    )

    const result = await drizzle
        .with(assetTagResponse)
        .select()
        .from(assets)
        .innerJoin(assetTagResponse, eq(assetTagResponse.assetId, assets.id))
        .where(
            and(
                searchQuery && like(assets.name, `%${searchQuery}%`),
                gameList &&
                    or(...gameList.map((game) => eq(assets.game, game))),
                assetCategoryList &&
                    or(
                        ...assetCategoryList.map((category) =>
                            eq(assets.assetCategory, category)
                        )
                    ),
                eq(assets.status, 1)
            )
        )
        .leftJoin(users, eq(users.id, assets.uploadedById))
        .orderBy(desc(assets.uploadedDate))
        .limit(500)

    response = c.json(
        {
            success: true,
            status: "ok",
            query,
            gameQuery,
            assetCategoryQuery,
            assetTagsQuery,
            results: result ?? [],
        },
        200,
        responseHeaders
    )

    response.headers.set("Cache-Control", "s-maxage=600")
    await cache.put(cacheKey, response.clone())
    return response
}
