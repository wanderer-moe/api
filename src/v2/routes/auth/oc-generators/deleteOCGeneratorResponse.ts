import { auth } from "@/v2/lib/auth/lucia"
import type { APIContext as Context } from "@/worker-configuration"
import { savedOcGenerators } from "@/v2/db/schema"
import { getConnection } from "@/v2/db/turso"
import { eq, and } from "drizzle-orm"

export async function deleteOCGeneratorResponse(c: Context): Promise<Response> {
	const authRequest = auth(c.env).handleRequest(c)
	const session = await authRequest.validate()

	if (!session || session.state === "idle" || session.state === "invalid") {
		if (session) {
			await auth(c.env).invalidateSession(session.sessionId)
			authRequest.setSession(null)
		}
		c.status(401)
		return c.json({ success: false, state: "unauthorized" })
	}

	const drizzle = getConnection(c.env).drizzle

	const formData = await c.req.formData()
	const deleteID = (formData.get("deleteID") as string) || null

	if (!formData || !deleteID)
		return c.json({ success: false, state: "no formdata provided" })

	const ocGeneratorResponse = await drizzle
		.select()
		.from(savedOcGenerators)
		.where(
			and(
				eq(savedOcGenerators.id, deleteID),
				eq(savedOcGenerators.userId, session.userId)
			)
		)

	if (!ocGeneratorResponse)
		return c.json({
			success: false,
			state: "no generator found matching id",
		})

	await drizzle
		.delete(savedOcGenerators)
		.where(
			and(
				eq(savedOcGenerators.id, deleteID),
				eq(savedOcGenerators.userId, session.userId)
			)
		)

	c.status(200)
	return c.json({
		success: true,
		state: `deleted saved oc generator with id ${deleteID}`,
		ocGeneratorResponse,
	})
}
