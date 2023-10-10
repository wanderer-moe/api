import { auth } from "@/v2/lib/auth/lucia"

import { savedOcGenerators } from "@/v2/db/schema"
import { getConnection } from "@/v2/db/turso"
import { eq } from "drizzle-orm"

export async function viewOCGeneratorResponses(
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

    const ocGeneratorResponses = await drizzle
        .select()
        .from(savedOcGenerators)
        .where(eq(savedOcGenerators.userId, session.user.userId))

    return c.json(
        {
            success: true,
            state: "valid session",
            ocGeneratorResponses,
        },
        401
    )
}
