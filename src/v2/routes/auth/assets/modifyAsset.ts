import { responseHeaders } from "@/v2/lib/responseHeaders"
import { getConnection } from "@/v2/db/turso"
import { assets } from "@/v2/db/schema"
import { eq } from "drizzle-orm"

import { auth } from "@/v2/lib/auth/lucia"
import { roleFlagsToArray } from "@/v2/lib/helpers/roleFlags"
import { SplitQueryByCommas } from "@/v2/lib/helpers/splitQueryByCommas"

export async function modifyAssetData(c: APIContext): Promise<Response> {
    const { assetIdToModify } = c.req.param()
    const authRequest = auth(c.env).handleRequest(c)
    const session = await authRequest.validate()

    if (!session || session.state === "idle" || session.state === "invalid") {
        if (session) {
            await auth(c.env).invalidateSession(session.sessionId)
            authRequest.setSession(null)
        }
        c.status(401)
        return c.json({ success: false, state: "invalid session" })
    }

    // return unauthorized if user is not a contributor
    if (session.user.is_contributor !== 1) {
        c.status(401)
        return c.json({ success: false, state: "unauthorized" })
    }

    const drizzle = getConnection(c.env).drizzle

    const asset = await drizzle.query.assets.findFirst({
        where: (assets, { eq }) => eq(assets.id, parseInt(assetIdToModify)),
    })

    if (!asset) {
        c.status(200)
        return c.json({ success: false, state: "asset not found" })
    }

    const roleFlags = roleFlagsToArray(session.user.role_flags)

    if (
        asset.uploadedById !== session.userId ||
        !roleFlags.includes("CREATOR")
    ) {
        c.status(401)
        return c.json({
            success: false,
            state: "unauthorized to modify this asset",
        })
    }

    const formData = await c.req.formData()

    const metadata = {
        name: formData.get("name") as string | null,
        game: formData.get("game") as string | null,
        assetCategory: formData.get("assetCategory") as string | null,
        tags: SplitQueryByCommas(formData.get("tags") as string | null),
    }

    Object.keys(metadata).forEach(
        (key) => metadata[key] === null && delete metadata[key]
    )

    const updatedAsset = await drizzle
        .update(assets)
        .set({
            ...metadata,
        })
        .where(eq(assets.id, parseInt(assetIdToModify)))
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
