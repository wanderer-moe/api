import { auth } from "@/v2/lib/auth/lucia"
import { getConnection } from "@/v2/db/turso"
import { assets, assetTagsAssets } from "@/v2/db/schema"

import { eq } from "drizzle-orm"
import { SplitQueryByCommas } from "@/v2/lib/helpers/splitQueryByCommas"

export async function uploadAsset(c: APIContext): Promise<Response> {
    const authRequest = auth(c.env).handleRequest(c)
    const session = await authRequest.validate()

    if (!session || session.state === "idle") {
        if (session) {
            await auth(c.env).invalidateSession(session.sessionId)
            authRequest.setSession(null)
        }
        c.status(401)
        return c.json({ success: false, state: "unauthorized" })
    }

    // return unauthorized if user is not a contributor
    if (session.user.isContributor !== 1) {
        c.status(401)
        return c.json({ success: false, state: "unauthorized" })
    }

    const bypassApproval = session.user.isContributor === 1

    const drizzle = getConnection(c.env).drizzle

    const formData = await c.req.formData()
    const asset = formData.get("asset") as unknown as File | null

    const metadata = {
        name: formData.get("name") as string, // e.g keqing
        extension: formData.get("extension") as string, // e.g png
        tags: SplitQueryByCommas(formData.get("tags") as string), // e.g no-background, fanmade, official => ["no-background", "fanmade", "official"]
        category: formData.get("category") as string, // e.g splash-art
        game: formData.get("game") as string, // e.g genshin-impact
        size: formData.get("size") as unknown as number, // e.g 1024
        width: formData.get("width") as unknown as number, // e.g 1920
        height: formData.get("height") as unknown as number, // e.g 1080
    }

    if (metadata.tags.length > 5)
        return c.json({
            success: false,
            state: `too many tags (${metadata.tags.length}). maximum is 5 tags per asset`,
        })

    const newAsset = {
        name: metadata.name,
        extension: metadata.extension,
        game: metadata.game,
        assetCategory: metadata.category,
        url: `/assets/${metadata.game}/${metadata.category}/${metadata.name}.${metadata.extension}`,
        uploadedById: session.user.userId,
        status: bypassApproval ? 1 : 2,
        uploadedDate: new Date().getTime(),
        fileSize: asset.size, // stored in bytes
        width: metadata.width,
        height: metadata.height,
    }

    // rename file name to match metadata
    const newAssetFile = new File([asset], newAsset.name, {
        type: asset.type,
    })

    try {
        await c.env.FILES_BUCKET.put(
            `/assets/${metadata.game}/${metadata.category}/${metadata.name}.${metadata.extension}`,
            newAssetFile
        )

        await drizzle.transaction(async (trx) => {
            const newAssetDB = await trx
                .insert(assets)
                .values(newAsset)
                .returning({
                    assetId: assets.id,
                })
            if (metadata.tags.length > 0) {
                for (const tag of metadata.tags) {
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
                                assetId: newAssetDB[0].assetId,
                                assetTagId: tagExists[0].assetTagId,
                            })
                            .returning({
                                assetTagId: assetTagsAssets.assetTagId,
                            })
                    } else {
                        continue
                    }
                }
            }
        })
    } catch (e) {
        await c.env.FILES_BUCKET.delete(
            `/assets/${metadata.game}/${metadata.category}/${metadata.name}.${metadata.extension}`
        )
        c.status(500)
        return c.json({ success: false, state: "failed to upload asset" })
    }

    c.status(200)
    return c.json({ success: true, state: "uploaded asset" })
}
