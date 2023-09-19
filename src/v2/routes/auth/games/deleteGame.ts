import { auth } from "@/v2/lib/auth/lucia"
import { roleFlagsToArray } from "@/v2/lib/helpers/roleFlags"
import { getConnection } from "@/v2/db/turso"

import { games } from "@/v2/db/schema"
import { eq } from "drizzle-orm"

export async function deleteGame(c: APIContext): Promise<Response> {
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

    const roleFlags = roleFlagsToArray(session.user.role_flags)

    if (!roleFlags.includes("CREATOR")) {
        c.status(401)
        return c.json({ success: false, state: "unauthorized" })
    }

    const drizzle = getConnection(c.env).drizzle

    const formData = await c.req.formData()

    const game = {
        id: formData.get("id") as string | null,
    }

    if (!game.id) {
        return c.json({ success: false, state: "no id entered" }, 200)
    }

    // check if game exists
    const gameExists = await drizzle.query.games.findFirst({
        where: (games, { eq }) => eq(games.id, game.id),
    })

    if (!gameExists) {
        c.status(404)
        return c.json({ success: false, state: "game with ID doesn't exist" })
    }

    try {
        await drizzle.delete(games).where(eq(games.id, game.id)).execute()
    } catch (e) {
        c.status(500)
        return c.json({ success: false, state: "failed to delete game" })
    }

    c.status(200)
    return c.json({ success: true, state: "deleted game", game })
}
