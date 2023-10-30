import { responseHeaders } from "@/v2/lib/response-headers"
import { getConnection } from "@/v2/db/turso"
import { asset, AssetStatus } from "@/v2/db/schema"
import { eq } from "drizzle-orm"

import { auth } from "@/v2/lib/auth/lucia"
import { roleFlagsToArray } from "@/v2/lib/helpers/role-flags"

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

    const foundAsset = await drizzle.query.asset.findFirst({
        where: (asset, { eq }) => eq(asset.id, parseInt(assetIdToApprove)),
    })

    if (!foundAsset || foundAsset.status === "approved") {
        c.json(
            { success: false, state: "asset not found or already approved" },
            200
        )
    }

    const updatedAsset = await drizzle
        .update(asset)
        .set({
            status: "approved" as AssetStatus,
        })
        .where(eq(asset.id, parseInt(assetIdToApprove)))
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
