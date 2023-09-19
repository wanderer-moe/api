import { auth } from "@/v2/lib/auth/lucia"
import { getConnection } from "@/v2/db/turso"

export async function viewFavoriteAssets(c: APIContext): Promise<Response> {
    const drizzle = getConnection(c.env).drizzle

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

    // check if userFavorites exists
    const userFavoritesExists = await drizzle.query.userFavorites.findFirst({
        where: (userFavorites, { eq }) =>
            eq(userFavorites.userId, session.userId),
    })

    if (!userFavoritesExists) {
        c.status(200)
        return c.json({ success: false, state: "no favorites found" })
    }

    const favoriteAssets = await drizzle.query.userFavoritesAssets.findMany({
        where: (userFavoritesAssets, { eq }) =>
            eq(userFavoritesAssets.userFavoritesId, userFavoritesExists.id),
        with: {
            assets: true,
        },
    })

    c.status(200)
    return c.json({ success: true, state: "found favorites", favoriteAssets })
}
