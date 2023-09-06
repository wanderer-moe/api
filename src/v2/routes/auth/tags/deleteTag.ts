import { auth } from "@/v2/lib/auth/lucia"
import { roleFlagsToArray } from "@/v2/lib/helpers/roleFlags"
import { getConnection } from "@/v2/db/turso"
import { APIContext as Context } from "@/worker-configuration"
import { assetTags } from "@/v2/db/schema"
import { eq } from "drizzle-orm"

export async function deleteTag(c: Context): Promise<Response> {
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

	const drizzle = getConnection(c.env).drizzle

	const formData = await c.req.formData()

	const tag = {
		id: formData.get("id") as string | null,
	}

	if (!tag.id) {
		return c.json({ success: false, state: "no id entered" }, 200)
	}

	// check if tag exists
	const tagExists = await drizzle.query.assetTags.findFirst({
		where: (assetTags, { eq }) => eq(assetTags.id, tag.id),
	})

	if (!tagExists) {
		return c.json(
			{ success: false, state: "tag with ID doesn't exist" },
			200
		)
	}

	try {
		await drizzle
			.delete(assetTags)
			.where(eq(assetTags.id, tag.id))
			.execute()
	} catch (e) {
		return c.json({ success: false, state: "failed to delete tag" }, 200)
	}

	return c.json({ success: true, state: "deleted tag", tag }, 200)
}
