import { OpenAPIHono } from "@hono/zod-openapi"
import { allAssetLikesRoute } from "./openapi"
import { getConnection } from "@/v2/db/turso"
import { AssetLikesManager } from "@/v2/lib/managers/asset/asset-likes"
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
    const assetLikeManager = new AssetLikesManager(drizzle)

    const likes = await assetLikeManager.getUsersLikedAssets(user.id)

    return ctx.json(
        {
            success: true,
            likes,
        },
        200
    )
})

export default handler
