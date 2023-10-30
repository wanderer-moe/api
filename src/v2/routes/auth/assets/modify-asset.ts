import { responseHeaders } from "@/v2/lib/response-headers"
import { getConnection } from "@/v2/db/turso"
import { assetTagAsset, asset } from "@/v2/db/schema"
import { eq } from "drizzle-orm"
import { SplitQueryByCommas } from "@/v2/lib/helpers/split-query-by-commas"
import { auth } from "@/v2/lib/auth/lucia"
import { roleFlagsToArray } from "@/v2/lib/helpers/role-flags"

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

    const foundAsset = await drizzle.query.asset.findFirst({
        where: (asset, { eq }) => eq(asset.id, parseInt(assetIdToModify)),
        with: {
            assetTagAsset: {
                with: {
                    assetTag: true,
                },
            },
        },
    })

    if (!foundAsset) {
        return c.json({ success: false, state: "asset not found" }, 200)
    }

    const roleFlags = roleFlagsToArray(session.user.roleFlags)

    if (
        foundAsset.uploadedById !== session.user.userId ||
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
        .update(asset)
        .set({
            ...metadata,
        })
        .where(eq(asset.id, parseInt(assetIdToModify)))
        .execute()

    const validTags = []
    const invalidTags = []

    if (tags && tags.length > 0) {
        // remove all existing tags
        await drizzle
            .delete(assetTagAsset)
            .where(eq(assetTagAsset.assetId, parseInt(assetIdToModify)))
            .execute()

        // add new tags
        await drizzle.transaction(async (trx) => {
            for (const tag of tags) {
                const tagExists = await trx.query.assetTag.findFirst({
                    where: (assetTag) => {
                        return eq(assetTag.name, tag)
                    },
                })
                if (tagExists) {
                    await trx
                        .insert(assetTagAsset)
                        .values({
                            id: crypto.randomUUID(),
                            assetId: parseInt(assetIdToModify),
                            assetTagId: tagExists[0].assetTagId,
                        })
                        .returning({
                            assetTagId: assetTagAsset.assetTagId,
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
