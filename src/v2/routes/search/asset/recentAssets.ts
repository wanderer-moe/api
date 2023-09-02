import { responseHeaders } from "@/v2/lib/responseHeaders"
import { getConnection } from "@/v2/db/turso"
import { desc } from "drizzle-orm"
import type { APIContext as Context } from "@/worker-configuration"
import { assets } from "@/v2/db/schema"

// get 100 most recent assets, sorted by asset.upload
export async function recentAssets(c: Context): Promise<Response> {
	const cacheKey = new Request(c.req.url.toString(), c.req)
	const cache = caches.default
	let response = await cache.match(cacheKey)

	if (response) return response

	const drizzle = await getConnection(c.env).drizzle

	const assetResponse = await drizzle
		.select()
		.from(assets)
		.orderBy(desc(assets.uploadedDate))
		.limit(100)
		.execute()

	response = c.json(
		{
			success: true,
			status: "ok",
			results: assetResponse,
		},
		200,
		responseHeaders
	)

	response.headers.set("Cache-Control", "s-maxage=60")
	await cache.put(cacheKey, response.clone())
	return response
}
