import { responseHeaders } from "@/v2/lib/responseHeaders"
import { getConnection } from "@/v2/db/turso"
import { assetTagsAssets, assets } from "@/v2/db/schema"
import { eq } from "drizzle-orm"
import { SplitQueryByCommas } from "@/v2/lib/helpers/splitQueryByCommas"
import { auth } from "@/v2/lib/auth/lucia"
import { roleFlagsToArray } from "@/v2/lib/helpers/roleFlags"

export async function modifyAssetData(c: APIContext): Promise<Response> {
    const { assetIdToModify } = c.req.param()
    const authRequest = auth(c.env).handleRequest(c)
    const session = await authRequest.validate()

    if (!session || session.state === "idle") {
        if (session) {
            await auth(c.env).invalidateSession(session.sessionId)
            authRequest.setSession(null)
        }
        return c.json({ success: false, state: "invalid session" }, 401)
    }

    // return unauthorized if user is not a contributor
    if (session.user.isContributor === 0) {
        return c.json({ success: false, state: "unauthorized" }, 401)
    }

    const { drizzle } = getConnection(c.env)

    const asset = await drizzle.query.assets.findFirst({
        where: (assets, { eq }) => eq(assets.id, parseInt(assetIdToModify)),
        with: {
            assetTagsAssets: {
                with: {
                    assetTags: true,
                },
            },
        },
    })

    if (!asset) {
        return c.json({ success: false, state: "asset not found" }, 200)
    }

    const roleFlags = roleFlagsToArray(session.user.roleFlags)

    if (
        asset.uploadedById !== session.user.userId ||
        !roleFlags.includes("CREATOR")
    ) {
        return c.json(
            {
                success: false,
                state: "unauthorized to modify this asset",
            },
            401
        )
    }

    const formData = await c.req.formData()

    const metadata = {
        name: formData.get("name") as string | null,
        game: formData.get("game") as string | null,
        assetCategory: formData.get("assetCategory") as string | null,
    }

    Object.keys(metadata).forEach(
        (key) => metadata[key] === null && delete metadata[key]
    )

    const tags = SplitQueryByCommas(formData.get("tags") as string | null)

    const updatedAsset = await drizzle
        .update(assets)
        .set({
            ...metadata,
        })
        .where(eq(assets.id, parseInt(assetIdToModify)))
        .execute()

    const validTags = []
    const invalidTags = []

    if (tags && tags.length > 0) {
        // remove all existing tags
        await drizzle
            .delete(assetTagsAssets)
            .where(eq(assetTagsAssets.assetId, parseInt(assetIdToModify)))
            .execute()

        // add new tags
        await drizzle.transaction(async (trx) => {
            for (const tag of tags) {
                const tagExists = await trx.query.assetTags.findFirst({
                    where: (assetTags) => {
                        return eq(assetTags.name, tag)
                    },
                })
                if (tagExists) {
                    await trx
                        .insert(assetTagsAssets)
                        .values({
                            id: crypto.randomUUID(),
                            assetId: parseInt(assetIdToModify),
                            assetTagId: tagExists[0].assetTagId,
                        })
                        .returning({
                            assetTagId: assetTagsAssets.assetTagId,
                        })
                    validTags.push(tag)
                } else {
                    invalidTags.push(tag)
                }
            }
        })

        const response = c.json(
            {
                success: true,
                status: "ok",
                updatedAsset,
                validTags: validTags ? validTags : undefined,
                invalidTags: invalidTags ? invalidTags : undefined,
            },
            200,
            responseHeaders
        )

        return response
    }
}
