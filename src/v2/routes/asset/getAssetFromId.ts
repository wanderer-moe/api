import { responseHeaders } from "@/v2/lib/responseHeaders"
import { getConnection } from "@/v2/db/turso"
import { assets } from "@/v2/db/schema"
import { createNotFoundResponse } from "@/v2/lib/helpers/responses/notFoundResponse"
import { desc } from "drizzle-orm"
import type { APIContext as Context } from "@/worker-configuration"

export async function getAssetFromId(c: Context): Promise<Response> {
	const { id } = c.req.param()
	const cacheKey = new Request(c.req.url.toString(), c.req)
	const cache = caches.default
	let response = await cache.match(cacheKey)

	if (response) return response

	const drizzle = await getConnection(c.env).drizzle

	const asset = await drizzle.query.assets.findFirst({
		where: (assets, { eq, and }) =>
			and(eq(assets.status, 1), eq(assets.id, parseInt(id))),
		with: {
			assetTagsAssets: {
				with: {
					assetTags: true,
				},
			},
		},
	})

	if (!asset) {
		response = createNotFoundResponse(c, "Asset not found", responseHeaders)
		await cache.put(cacheKey, response.clone())
		return response
	}

	const similarAssets = await drizzle.query.assets.findMany({
		where: (assets, { eq, and }) =>
			and(
				eq(assets.status, 1),
				eq(assets.assetCategory, asset.assetCategory)
			),
		limit: 6,
		orderBy: desc(assets.id),
	})

	response = c.json(
		{
			success: true,
			status: "ok",
			asset,
			similarAssets,
		},
		200,
		responseHeaders
	)

	response.headers.set("Cache-Control", "s-maxage=604800")
	await cache.put(cacheKey, response.clone())

	return response
}
