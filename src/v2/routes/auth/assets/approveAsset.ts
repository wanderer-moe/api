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
        return c.json({ success: false, state: "unauthorized" }, 401)
    }

    const roleFlags = roleFlagsToArray(session.user.roleFlags)

    if (!roleFlags.includes("CREATOR")) {
        return c.json({ success: false, state: "unauthorized" }, 401)
    }

    const { drizzle } = getConnection(c.env)

    const asset = await drizzle.query.assets.findFirst({
        where: (assets, { eq }) => eq(assets.id, parseInt(assetIdToApprove)),
    })

    if (!asset || asset.status === 1) {
        c.json(
            { success: false, state: "asset not found or already approved" },
            200
        )
    }

    const updatedAsset = await drizzle
        .update(assets)
        .set({
            status: 1,
        })
        .where(eq(assets.id, parseInt(assetIdToApprove)))
        .execute()

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
