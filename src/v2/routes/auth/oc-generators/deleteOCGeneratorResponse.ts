import { auth } from "@/v2/lib/auth/lucia"

import { savedOcGenerators } from "@/v2/db/schema"
import { getConnection } from "@/v2/db/turso"
import { eq, and } from "drizzle-orm"

export async function deleteOCGeneratorResponse(
    c: APIContext
): Promise<Response> {
    const authRequest = auth(c.env).handleRequest(c)
    const session = await authRequest.validate()

    if (!session || session.state === "idle") {
        if (session) {
            await auth(c.env).invalidateSession(session.sessionId)
            authRequest.setSession(null)
        }
        return c.json({ success: false, state: "unauthorized" }, 401)
    }

    const drizzle = getConnection(c.env).drizzle

    const formData = await c.req.formData()
    const deleteID = (formData.get("deleteID") as string) || null

    if (!formData || !deleteID)
        return c.json({ success: false, state: "no formdata provided" }, 200)

    const ocGeneratorResponse = await drizzle
        .select()
        .from(savedOcGenerators)
        .where(
            and(
                eq(savedOcGenerators.id, deleteID),
                eq(savedOcGenerators.userId, session.user.userId)
            )
        )

    if (!ocGeneratorResponse)
        return c.json({
            success: false,
            state: "no generator found matching id",
        })

    await drizzle
        .delete(savedOcGenerators)
        .where(
            and(
                eq(savedOcGenerators.id, deleteID),
                eq(savedOcGenerators.userId, session.user.userId)
            )
        )

    return c.json(
        {
            success: true,
            state: `deleted saved oc generator with id ${deleteID}`,
            ocGeneratorResponse,
        },
        200
    )
}
