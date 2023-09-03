import { getConnection } from "@/v2/db/turso"
import type { APIContext as Context } from "@/worker-configuration"

export async function listAllAssetTags(c: Context): Promise<Response> {
	const cacheKey = new Request(c.req.url.toString(), c.req)
	const cache = caches.default
	let response = await cache.match(cacheKey)

	if (response) return response

	const drizzle = await getConnection(c.env).drizzle

	const allAssetTags = await drizzle.query.assetTags.findMany({
		orderBy: (assetTags) => assetTags.name,
		with: {
			assetTagsAssets: {
				with: {
					assets: true,
				},
			},
		},
	})

	response = c.json(
		{
			success: true,
			status: "ok",
			allAssetTags,
		},
		200
	)

	response.headers.set("Cache-Control", "s-maxage=604800")
	await cache.put(cacheKey, response.clone())

	return response
}
