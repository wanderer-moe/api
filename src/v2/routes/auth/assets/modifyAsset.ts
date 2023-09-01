import { responseHeaders } from "@/v2/lib/responseHeaders"
import { getConnection } from "@/v2/db/turso"
import { assets } from "@/v2/db/schema"
import { createNotFoundResponse } from "@/v2/lib/helpers/responses/notFoundResponse"
import { eq } from "drizzle-orm"
import type { APIContext as Context } from "@/worker-configuration"
import { auth } from "@/v2/lib/auth/lucia"
import { roleFlagsToArray } from "@/v2/lib/auth/roleFlags"

export async function modifyAssetData(c: Context): Promise<Response> {
	const { assetIdToModify } = c.req.param()
	const authRequest = auth(c.env).handleRequest(c)
	const session = await authRequest.validate()

	if (!session || session.state === "idle" || session.state === "invalid") {
		if (session) {
			await auth(c.env).invalidateSession(session.sessionId)
			authRequest.setSession(null)
		}
		return c.json({ success: false, state: "invalid session" }, 200)
	}

	// return unauthorized if user is not a contributor
	if (session.user.is_contributor !== 1)
		return c.json({ success: false, state: "unauthorized" }, 401)

	const drizzle = await getConnection(c.env).drizzle

	const asset = await drizzle.query.assets.findFirst({
		where: (assets, { eq }) => eq(assets.id, parseInt(assetIdToModify)),
	})

	if (!asset) {
		return createNotFoundResponse(c, "Asset not found", responseHeaders)
	}

	const roleFlags = roleFlagsToArray(session.user.role_flags)

	if (
		asset.uploadedById !== session.userId ||
		!roleFlags.includes("CREATOR")
	) {
		return c.json(
			{ success: false, state: "unauthorized to modify this asset" },
			401
		)
	}

	const formData = await c.req.formData()

	const metadata = {
		game: formData.get("game") as string | null,
		assetCategory: formData.get("assetCategory") as string | null,
	}

	Object.keys(metadata).forEach(
		(key) => metadata[key] === null && delete metadata[key]
	)

	const updatedAsset = await drizzle
		.update(assets)
		.set({
			...metadata,
		})
		.where(eq(assets.id, parseInt(assetIdToModify)))
		.execute()

	const response = c.json(
		{
			success: true,
			status: "ok",
			updatedAsset,
		},
		200,
		responseHeaders
	)

	return response
}
