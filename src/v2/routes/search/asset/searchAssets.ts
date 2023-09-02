import { responseHeaders } from "@/v2/lib/responseHeaders"
import { getConnection } from "@/v2/db/turso"
import { like } from "drizzle-orm"
import type { APIContext as Context } from "@/worker-configuration"
import { SplitQueryByCommas } from "@/v2/lib/helpers/splitQueryByCommas"

export async function searchForAssets(c: Context): Promise<Response> {
	const cacheKey = new Request(c.req.url.toString(), c.req)
	const cache = caches.default
	let response = await cache.match(cacheKey)
	if (response) return response

	const { query, game, assetCategory, assetTags } = c.req.query()

	// search parameters can include optional search params: query, game, assetCategory, assetTags
	// query?: string => ?query=keqing
	// game?: comma separated list of game names => ?game=genshin-impact,honkai-impact-3rd
	// assetCategory?: comma separated list of asset category names => ?assetCategory=splash-art,character-sheets
	// assetTags?: comma separated list of asset tag names => ?assetTags=no-background,fanmade,official

	const drizzle = await getConnection(c.env).drizzle

	// check if certian search parameters are present, if not, set them to null
	const searchQuery = query ?? null
	const gameList = game ? SplitQueryByCommas(game) : null
	const assetCategoryList = assetCategory
		? SplitQueryByCommas(assetCategory)
		: null
	const assetTagsList = assetTags ? SplitQueryByCommas(assetTags) : null

	// query the database for assets that match the search parameters
	const assetResponse = await drizzle.query.assets.findMany({
		where: (assets, { and, or, eq }) => {
			return and(
				searchQuery ? like(assets.name, `%${searchQuery}%`) : null,
				gameList
					? or(...gameList.map((game) => eq(assets.game, game)))
					: null,
				assetCategoryList
					? or(
							...assetCategoryList.map((assetCategory) =>
								eq(assets.assetCategory, assetCategory)
							)
					  )
					: null,
				eq(assets.status, 1)
			)
		},
		...(assetTagsList.length > 0
			? {
					with: {
						assetTags: {
							where: (assetTags, { and, eq }) => {
								return and(
									...assetTagsList.map((assetTag) =>
										eq(assetTags.name, assetTag)
									)
								)
							},
						},
					},
			  }
			: {}),
	})

	response = c.json(
		{
			success: true,
			status: "ok",
			query,
			game,
			assetCategory,
			assetTags,
			results: assetResponse ? assetResponse : [],
		},
		200,
		responseHeaders
	)

	response.headers.set("Cache-Control", "s-maxage=600")
	await cache.put(cacheKey, response.clone())
	return response
}
