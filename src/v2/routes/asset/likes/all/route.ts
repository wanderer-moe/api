import { OpenAPIHono } from "@hono/zod-openapi"
import { allAssetLikesRoute } from "./openapi"
import { getConnection } from "@/v2/db/turso"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(allAssetLikesRoute, async (ctx) => {
    const authSessionManager = new AuthSessionManager(ctx)
    const { user } = await authSessionManager.validateSession()

    if (!user) {
        return ctx.json(
            {
                success: false,
                message: "Unauthorized",
            },
            401
        )
    }

    const { drizzle } = await getConnection(ctx.env)

    const likes = await drizzle.query.assetLikes.findMany({
        where: (assetLikes, { eq }) => eq(assetLikes.likedById, user.id),
        with: {
            asset: {
                with: {
                    assetTagAsset: {
                        with: {
                            assetTag: true,
                        },
                    },
                },
            },
        },
        offset: 0,
    })

    return ctx.json(
        {
            success: true,
            likes,
        },
        200
    )
})

export default handler
