import { auth } from "@/v2/lib/auth/lucia"
import { getConnection } from "@/v2/db/turso"
import { APIContext as Context } from "@/worker-configuration"
import { userCollections } from "@/v2/db/schema"

export async function createAssetCollection(c: Context): Promise<Response> {
	const drizzle = getConnection(c.env).drizzle

	const authRequest = auth(c.env).handleRequest(c)
	const session = await authRequest.validate()

	if (!session || session.state === "idle" || session.state === "invalid") {
		if (session) {
			await auth(c.env).invalidateSession(session.sessionId)
			authRequest.setSession(null)
		}
		return c.json({ success: false, state: "invalid session" }, 200)
	}

	const formData = await c.req.formData()

	const collection = {
		name: formData.get("collectionName") as string | null,
		description: formData.get("collectionDescription") as string | null,
	}

	if (!collection.name) {
		return c.json(
			{ success: false, state: "no collection name entered" },
			200
		)
	}

	if (!collection.description) {
		return c.json(
			{ success: false, state: "no collection description entered" },
			200
		)
	}

	// check if collection exists
	const collectionExists = await drizzle.query.userCollections.findFirst({
		where: (userCollections, { eq }) =>
			eq(userCollections.name, collection.name),
	})

	if (collectionExists) {
		return c.json(
			{ success: false, state: "collection with name already exists" },
			200
		)
	}

	// create entry in userCollections
	await drizzle
		.insert(userCollections)
		.values({
			id: crypto.randomUUID(),
			name: collection.name,
			description: collection.description,
			userId: session.userId,
			isPublic: 0, // default to private
		})
		.execute()

	return c.json({ success: true, state: "created collection" }, 200)
}
