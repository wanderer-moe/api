import { auth } from "@/v2/lib/auth/lucia"
import { getConnection } from "@/v2/db/turso"
import { eq } from "drizzle-orm"
import { z } from "zod"
import { userFavorite, userFavoriteAsset } from "@/v2/db/schema"

const RemoveFavoriteAssetSchema = z.object({
    assetToRemove: z.string({
        required_error: "Asset ID is required",
        invalid_type_error: "Asset ID must be a string",
    }),
})

export async function removeFavoriteAsset(c: APIContext): Promise<Response> {
    const formData = RemoveFavoriteAssetSchema.safeParse(
        await c.req.formData().then((formData) => {
            const data = Object.fromEntries(formData.entries())
            return data
        })
    )

    if (!formData.success) {
        return c.json({ success: false, state: "invalid data" }, 400)
    }

    const { assetToRemove } = formData.data

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

    // check if asset exists
    const asset = await drizzle.query.assets.findFirst({
        where: (assets, { eq }) => eq(assets.id, parseInt(assetToRemove)),
    })

    if (!asset) {
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
                id: `${session.user.userId}-${assetToRemove}`,
                userId: session.user.userId,
                isPublic: 0, // default to private
            })
            .execute()
    }

    const isFavorited = await drizzle.query.userFavorite.findFirst({
        where: (userFavoriteAsset, { eq }) =>
            eq(userFavoriteAsset.id, `${session.user.userId}-${assetToRemove}`),
    })

    if (!isFavorited) {
        return c.json(
            {
                success: false,
                state: "asset is not favorited, therefore cannot be removed",
                assetToRemove,
            },
            200
        )
    }

    // remove asset from userFavorite...
    try {
        await drizzle
            .delete(userFavoriteAsset)
            .where(
                eq(
                    userFavoriteAsset.id,
                    `${session.user.userId}-${assetToRemove}`
                )
            )
            .execute()
    } catch (e) {
        return c.json({ success: false, state: "failed to remove asset" }, 500)
    }

    return c.json({ success: true, state: "removed asset", assetToRemove }, 200)
}
