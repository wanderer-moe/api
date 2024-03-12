import { OpenAPIHono } from "@hono/zod-openapi"
import { assetSearchAllFilterRoute } from "./openapi"
import { getConnection } from "@/v2/db/turso"
import { SplitQueryByCommas } from "@/v2/lib/helpers/split-query-by-commas"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(assetSearchAllFilterRoute, async (ctx) => {
    const { drizzle } = await getConnection(ctx.env)

    const { name, game, category, tags, offset } = ctx.req.valid("query")

    const gameList = game ? SplitQueryByCommas(game.toLowerCase()) : null
    const categoryList = category
        ? SplitQueryByCommas(category.toLowerCase())
        : null
    const searchQuery = name ?? null
    const tagList = tags ? SplitQueryByCommas(tags.toLowerCase()) : null

    // is this bad for performance? probably
    const assets = await drizzle.query.asset.findMany({
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
                searchQuery ? like(asset.name, `%${searchQuery}%`) : undefined,
                gameList
                    ? or(...gameList.map((game) => eq(asset.gameId, game)))
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

    return ctx.json(
        {
            success: true,
            assets,
        },
        200
    )
})

export default handler
