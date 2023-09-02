import { responseHeaders } from "@/v2/lib/responseHeaders"
import { getConnection } from "@/v2/db/turso"
import { assets } from "@/v2/db/schema"
import { createNotFoundResponse } from "@/v2/lib/helpers/responses/notFoundResponse"
import { eq } from "drizzle-orm"
import type { APIContext as Context } from "@/worker-configuration"
import { auth } from "@/v2/lib/auth/lucia"
import { roleFlagsToArray } from "@/v2/lib/helpers/roleFlags"

export async function approveAsset(c: Context): Promise<Response> {
	const { assetIdToApprove } = c.req.param()
	const authRequest = auth(c.env).handleRequest(c)
	const session = await authRequest.validate()

	if (!session || session.state === "idle" || session.state === "invalid") {
		if (session) {
			await auth(c.env).invalidateSession(session.sessionId)
			authRequest.setSession(null)
		}
		return c.json({ success: false, state: "invalid session" }, 200)
	}

	const roleFlags = roleFlagsToArray(session.user.role_flags)

	if (!roleFlags.includes("CREATOR")) {
		return c.json({ success: false, state: "unauthorized" }, 401)
	}

	const drizzle = await getConnection(c.env).drizzle

	const asset = await drizzle.query.assets.findFirst({
		where: (assets, { eq }) => eq(assets.id, parseInt(assetIdToApprove)),
	})

	if (!asset) {
		return createNotFoundResponse(c, "Asset not found", responseHeaders)
	}

	const updatedAsset = await drizzle
		.update(assets)
		.set({
			status: 1,
		})
		.where(eq(assets.id, parseInt(assetIdToApprove)))
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
