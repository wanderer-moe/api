import { responseHeaders } from "@/v2/lib/response-headers"
import { getConnection } from "@/v2/db/turso"
import { auth } from "@/v2/lib/auth/lucia"
import { roleFlagsToArray } from "@/v2/lib/helpers/role-flags"

export async function getUnapprovedAssets(c: APIContext): Promise<Response> {
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

    if (!roleFlags.includes("STAFF")) {
        return c.json({ success: false, state: "unauthorized" }, 401)
    }

    const { drizzle } = getConnection(c.env)

    const unApprovedAssets =
        (await drizzle.query.assets.findMany({
            where: (assets, { eq }) => eq(assets.status, 0),
        })) ?? []

    return c.json(
        {
            success: true,
            status: "ok",
            unApprovedAssets,
        },
        200,
        responseHeaders
    )
}
