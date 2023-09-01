import { responseHeaders } from "@/v2/lib/responseHeaders"
import { getConnection } from "@/v2/db/turso"
import { createNotFoundResponse } from "@/v2/lib/helpers/responses/notFoundResponse"
import { eq } from "drizzle-orm"
import { assets } from "@/v2/db/schema"
import type { APIContext as Context } from "@/worker-configuration"

export async function downloadAsset(c: Context): Promise<Response> {
	const { assetId } = c.req.param()

	const drizzle = await getConnection(c.env).drizzle

	const asset = await drizzle
		.select()
		.from(assets)
		.where(eq(assets.id, parseInt(assetId)))
		.execute()

	if (!asset)
		return createNotFoundResponse(c, "Asset not found", responseHeaders)

	if (asset)
		await drizzle
			.update(assets)
			.set({ downloadCount: asset[0].downloadCount + 1 })
			.where(eq(assets.id, parseInt(assetId)))
			.execute()

	const response = await fetch(asset[0].url)

	const blob = await response.blob()

	const headers = new Headers()
	headers.set("Content-Disposition", `attachment; filename=${asset[0].name}`)

	return new Response(blob, {
		headers: headers,
	})
}
