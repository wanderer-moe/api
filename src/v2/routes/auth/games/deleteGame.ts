import { auth } from "@/v2/lib/auth/lucia"
import { roleFlagsToArray } from "@/v2/lib/helpers/roleFlags"
import { getConnection } from "@/v2/db/turso"
import { APIContext as Context } from "@/worker-configuration"
import { games } from "@/v2/db/schema"
import { eq } from "drizzle-orm"

export async function deleteGame(c: Context): Promise<Response> {
	const authRequest = auth(c.env).handleRequest(c)
	const session = await authRequest.validate()

	if (!session || session.state === "idle" || session.state === "invalid") {
		if (session) {
			await auth(c.env).invalidateSession(session.sessionId)
			authRequest.setSession(null)
		}
		return c.json({ success: false, state: "invalid session" }, 200)
	}

	const roleFlags = roleFlagsToArray(session.user.role_flags)

	if (!roleFlags.includes("CREATOR")) {
		return c.json({ success: false, state: "unauthorized" }, 401)
	}

	const drizzle = await getConnection(c.env).drizzle

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
		return c.json(
			{ success: false, state: "game with ID doesn't exist" },
			200
		)
	}

	try {
		await drizzle.delete(games).where(eq(games.id, game.id)).execute()
	} catch (e) {
		return c.json({ success: false, state: "failed to delete game" }, 200)
	}

	return c.json({ success: true, state: "deleted game", game }, 200)
}
