import { auth } from "@/v2/lib/auth/lucia"
import type { APIContext as Context } from "@/worker-configuration"
import { savedOcGenerators } from "@/v2/db/schema"
import { getConnection } from "@/v2/db/turso"
import { eq } from "drizzle-orm"

export async function viewOCGeneratorResponses(c: Context): Promise<Response> {
    const authRequest = auth(c.env).handleRequest(c)

    const session = await authRequest.validate()

    const drizzle = await getConnection(c.env).drizzle

    const ocGeneratorResponses = await drizzle
        .select()
        .from(savedOcGenerators)
        .where(eq(savedOcGenerators.userId, session.userId))

    return c.json(
        { success: true, state: "valid session", ocGeneratorResponses },
        200
    )
}
