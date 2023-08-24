import { responseHeaders } from "@/lib/responseHeaders"
import { getConnection } from "@/db/turso"
import { createNotFoundResponse } from "@/lib/helpers/responses/notFoundResponse"
import { eq } from "drizzle-orm"
import { assets } from "@/db/schema"

export async function downloadAsset(c): Promise<Response> {
    const { assetId } = c.req.param()

    const drizzle = await getConnection(c.env).drizzle

    const asset = await drizzle
        .select()
        .from(assets)
        .where(eq(assets.id, assetId))
        .execute()

    if (!asset)
        return createNotFoundResponse(c, "Asset not found", responseHeaders)

    const response = await fetch(asset[0].url)

    const blob = await response.blob()

    const headers = new Headers()
    headers.set("Content-Disposition", `attachment; filename=${asset[0].name}`)

    return new Response(blob, {
        headers: headers,
    })
}
