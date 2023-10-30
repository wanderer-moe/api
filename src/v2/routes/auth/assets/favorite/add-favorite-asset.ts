import { auth } from "@/v2/lib/auth/lucia"
import { getConnection } from "@/v2/db/turso"

import { userFavorite, userFavoriteAsset } from "@/v2/db/schema"

export async function favoriteAsset(c: APIContext): Promise<Response> {
    const { drizzle } = getConnection(c.env)

    const authRequest = auth(c.env).handleRequest(c)
    const session = await authRequest.validate()

    if (!session || session.state === "idle") {
        if (session) {
            await auth(c.env).invalidateSession(session.sessionId)
            authRequest.setSession(null)
        }
        return c.json({ success: false, state: "invalid session" }, 200)
    }

    const formData = await c.req.formData()

    const assetToFavorite = formData.get("assetIdToFavorite") as string | null

    if (!assetToFavorite) {
        return c.json({ success: false, state: "no assetid entered" }, 200)
    }

    // check if asset exists, and status is 1 (approved)
    const assetExists = await drizzle.query.asset.findFirst({
        where: (asset, { eq, and }) =>
            and(
                eq(asset.id, parseInt(assetToFavorite)),
                eq(asset.status, "approved")
            ),
    })

    if (!assetExists) {
        return c.json({ success: false, state: "asset not found" }, 200)
    }

    // this should never happen, but just in case it does, UX over reads/writes to the database
    const doesuserFavoriteExist = await drizzle.query.userFavorite.findFirst({
        where: (userFavorite, { eq }) =>
            eq(userFavorite.userId, session.user.userId),
    })

    if (!doesuserFavoriteExist) {
        // create entry in userFavorite
        await drizzle
            .insert(userFavorite)
            .values({
                id: `${session.user.userId}-${assetToFavorite}`,
                userId: session.user.userId,
                isPublic: 0, // default to private
            })
            .execute()
    }

    const isFavorited = await drizzle.query.userFavorite.findFirst({
        where: (userFavoriteAsset, { eq }) =>
            eq(
                userFavoriteAsset.id,
                `${session.user.userId}-${assetToFavorite}`
            ),
    })

    if (isFavorited) {
        return c.json(
            {
                success: false,
                state: "asset is already favorited, therefore cannot be favorited",
                assetToFavorite,
            },
            200
        )
    }

    // add asset to userFavorite...
    try {
        await drizzle.insert(userFavoriteAsset).values({
            id: `${session.user.userId}-${assetToFavorite}`,
            userFavoriteId: isFavorited.id,
            assetId: parseInt(assetToFavorite),
        })
    } catch (e) {
        return c.json(
            { success: false, state: "failed to favorite asset" },
            500
        )
    }

    return c.json(
        { success: true, state: "favorited asset", assetToFavorite },
        200
    )
}
