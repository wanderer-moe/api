import { responseHeaders } from "@/v2/lib/responseHeaders"
import { getConnection } from "@/v2/db/turso"
import { assets } from "@/v2/db/schema"
import { eq } from "drizzle-orm"

import { auth } from "@/v2/lib/auth/lucia"
import { roleFlagsToArray } from "@/v2/lib/helpers/roleFlags"

export async function approveAsset(c: APIContext): Promise<Response> {
    const { assetIdToApprove } = c.req.param()
    const authRequest = auth(c.env).handleRequest(c)
    const session = await authRequest.validate()

    if (!session || session.state === "idle") {
        if (session) {
            await auth(c.env).invalidateSession(session.sessionId)
            authRequest.setSession(null)
        }
        c.status(401)
        return c.json({ success: false, state: "unauthorized" }, 401)
    }

    const roleFlags = roleFlagsToArray(session.user.roleFlags)

    if (!roleFlags.includes("CREATOR")) {
        c.status(401)
        return c.json({ success: false, state: "unauthorized" })
    }

    const drizzle = getConnection(c.env).drizzle

    const asset = await drizzle.query.assets.findFirst({
        where: (assets, { eq }) => eq(assets.id, parseInt(assetIdToApprove)),
    })

    if (!asset || asset.status === 1) {
        c.status(404)
        c.json({ success: false, state: "asset not found or already approved" })
    }

    const updatedAsset = await drizzle
        .update(assets)
        .set({
            status: 1,
        })
        .where(eq(assets.id, parseInt(assetIdToApprove)))
        .execute()

    c.status(200)
    return c.json(
        {
            success: true,
            status: "ok",
            updatedAsset,
        },
        200,
        responseHeaders
    )
}
