import { auth } from "@/v2/lib/auth/lucia"
import { getConnection } from "@/v2/db/turso"

export async function viewFavoriteAssets(c: APIContext): Promise<Response> {
    const { drizzle } = getConnection(c.env)

    const authRequest = auth(c.env).handleRequest(c)
    const session = await authRequest.validate()

    if (!session || session.state === "idle") {
        if (session) {
            await auth(c.env).invalidateSession(session.sessionId)
            authRequest.setSession(null)
        }
        return c.json({ success: false, state: "invalid session" }, 401)
    }

    // check if userFavorite exists
    const userFavoriteExists = await drizzle.query.userFavorite.findFirst({
        where: (userFavorite, { eq }) =>
            eq(userFavorite.userId, session.user.userId),
    })

    if (!userFavoriteExists) {
        return c.json({ success: false, state: "no favorites found" }, 200)
    }

    const favoriteAssets = await drizzle.query.userFavoriteAsset.findMany({
        where: (userFavoriteAsset, { eq }) =>
            eq(userFavoriteAsset.userFavoriteId, userFavoriteExists.id),
        with: {
            assets: true,
        },
    })

    return c.json(
        { success: true, state: "found favorites", favoriteAssets },
        200
    )
}
