import { auth } from "@/v2/lib/auth/lucia"
import { roleFlagsToArray } from "@/v2/lib/helpers/roleFlags"
import { getConnection } from "@/v2/db/turso"
import { APIContext as Context } from "@/worker-configuration"
import { assetCategories } from "@/v2/db/schema"

export async function createAssetCategory(c: Context): Promise<Response> {
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

	const assetCategory = {
		id: crypto.randomUUID(),
		name: formData.get("name") as string,
		formattedName: formData.get("formattedName") as string,
		assetCount: 0,
		lastUpdated: new Date().getTime(), // unix timestamp
	}

	// check if assetCategory.name exists
	const assetCategoryExists = await drizzle.query.assetCategories.findFirst({
		where: (assetCategories, { eq }) =>
			eq(assetCategories.name, assetCategory.name),
	})

	if (assetCategoryExists) {
		return c.json(
			{ success: false, state: "assetCategory with name already exists" },
			200
		)
	}

	try {
		await drizzle.insert(assetCategories).values(assetCategory).execute()
	} catch (e) {
		return c.json(
			{ success: false, state: "failed to create assetCategory" },
			200
		)
	}

	return c.json(
		{ success: true, state: "created assetcategory", assetCategory },
		200
	)
}
