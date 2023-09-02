import { auth } from "@/v2/lib/auth/lucia"
import { roleFlagsToArray } from "@/v2/lib/helpers/roleFlags"
import { getConnection } from "@/v2/db/turso"
import { APIContext as Context } from "@/worker-configuration"
import { assetTags } from "@/v2/db/schema"

export async function createTag(c: Context): Promise<Response> {
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

	const formData = await c.req.formData()

	const tag = {
		id: crypto.randomUUID(),
		name: formData.get("name") as string,
		formattedName: formData.get("formattedName") as string,
		assetCount: 0,
		lastUpdated: new Date().getTime(), // unix timestamp
	}

	// check if tag.name exists
	const tagExists = await drizzle.query.assetTags.findFirst({
		where: (assetTags, { eq }) => eq(assetTags.name, tag.name),
	})

	if (tagExists) {
		return c.json(
			{ success: false, state: "tag with name already exists" },
			200
		)
	}

	try {
		await drizzle.insert(assetTags).values(tag).execute()
	} catch (e) {
		return c.json({ success: false, state: "failed to create tag" }, 200)
	}

	return c.json({ success: true, state: "created tag", tag }, 200)
}
