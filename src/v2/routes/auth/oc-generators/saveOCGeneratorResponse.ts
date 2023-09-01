import { auth } from "@/v2/lib/auth/lucia"
import type { APIContext as Context } from "@/worker-configuration"
import { savedOcGenerators } from "@/v2/db/schema"
import { getConnection } from "@/v2/db/turso"

export async function saveOCGeneratorResponse(c: Context): Promise<Response> {
    const authRequest = auth(c.env).handleRequest(c)
    const session = await authRequest.validate()

    if (!session || session.state === "idle" || session.state === "invalid") {
        if (session) {
            await auth(c.env).invalidateSession(session.sessionId)
            authRequest.setSession(null)
        }
        return c.json({ success: false, state: "invalid session" }, 200)
    }

    const drizzle = await getConnection(c.env).drizzle

    const formData = await c.req.formData()

    // TODO: make sure data is actually valid before inserting it into the database
    const ocGeneratorResponse = {
        id: crypto.randomUUID(),
        userId: session.userId as string,
        name: formData.get("name") as string,
        game: formData.get("game") as string,
        isPublic: parseInt(formData.get("isPublic") as string), // 1 = yes, 0 = no, default = 0
        content: formData.get("content") as string, // this is stored as json, which can then be parsed
    }

    await drizzle.insert(savedOcGenerators).values(ocGeneratorResponse)

    return c.json({ success: true, state: "saved", ocGeneratorResponse }, 200)
}
