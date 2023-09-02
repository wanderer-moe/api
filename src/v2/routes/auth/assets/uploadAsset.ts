import { auth } from "@/v2/lib/auth/lucia"
import { getConnection } from "@/v2/db/turso"
import { assets } from "@/v2/db/schema"
import type { APIContext as Context } from "@/worker-configuration"

export async function uploadAsset(c: Context): Promise<Response> {
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

	const bypassApproval = session.user.is_contributor === 1

	const drizzle = await getConnection(c.env).drizzle

	const formData = await c.req.formData()
	const asset = formData.get("asset") as unknown as File | null

	// this is temporary
	const asset128px = formData.get("asset128px") as unknown as File | null

	if (
		!asset ||
		asset.type !== "image/png" ||
		!asset128px ||
		asset128px.type !== "image/png"
	) {
		return c.json({ success: false, state: "invalid asset" }, 200)
	}

	// clear out metadata
	const metadata = {
		title: formData.get("title") as string, // e.g keqing
		extension: formData.get("extension") as string, // e.g png
		tags: formData.get("tags") as string, // e.g no-background, fanmade, official
		category: formData.get("category") as string, // e.g splash-art
		game: formData.get("game") as string, // e.g genshin-impact
		size: formData.get("size") as unknown as number, // e.g 1024
		width: formData.get("width") as unknown as number, // e.g 1920
		height: formData.get("height") as unknown as number, // e.g 1080
	}

	const newAsset = {
		name: `${metadata.title}.${metadata.extension}`,
		game: metadata.game,
		assetCategory: metadata.category,
		tags: metadata.tags,
		url: `/assets/${metadata.game}/${metadata.category}/${metadata.title}.${metadata.extension}`,
		uploadedById: session.userId,
		status: bypassApproval ? "approved" : "pending",
		uploadedDate: new Date().getTime(),
		fileSize: asset.size, // stored in bytes
		width: metadata.width,
		height: metadata.height,
	}

	// rename file name to match metadata
	const newAssetFile = new File([asset], newAsset.name, {
		type: asset.type,
	})

	const duplicateAsset = await drizzle.query.assets.findFirst({
		where: (assets, { and, eq }) =>
			and(
				eq(assets.name, newAsset.name),
				eq(assets.game, newAsset.game),
				eq(assets.assetCategory, newAsset.assetCategory)
			),
	})

	if (duplicateAsset)
		return c.json({ success: false, state: "duplicate asset" }, 400)

	try {
		await drizzle.transaction(async () => {
			await c.env.bucket.put(
				`/assets/${metadata.game}/${metadata.category}/${metadata.title}.${metadata.extension}`,
				newAssetFile
			)

			const newAssetClone = new File(
				[asset128px],
				`${metadata.title}-128.png`,
				{
					type: asset.type,
				}
			)

			await c.env.bucket.put(
				`/assets/${metadata.game}/${metadata.category}/${metadata.title}-128.png`,
				newAssetClone
			)
			await drizzle.insert(assets).values(newAsset)
		})
	} catch (e) {
		return c.json({ success: false, state: "failed to upload asset" }, 500)
	}

	return c.json({ success: true, state: "uploaded asset" }, 200)
}