import { OpenAPIHono } from "@hono/zod-openapi"
import { uploadAssetRoute } from "./openapi"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"
import { AssetManager } from "@/v2/lib/managers/asset/asset-manager"
import { getConnection } from "@/v2/db/turso"
const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(uploadAssetRoute, async (ctx) => {
    const { asset, name, tags, assetCategoryId, gameId, assetIsSuggestive } =
        ctx.req.valid("form")

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

    if (
        user.role != "creator" &&
        user.role != "contributor" &&
        user.role != "staff"
    ) {
        return ctx.json(
            {
                success: false,
                message: "Unauthorized",
            },
            401
        )
    }

    const { drizzle } = getConnection(ctx.env)
    const assetManager = new AssetManager(drizzle)

    const newAsset = await assetManager.createAsset(
        user.id,
        user.username,
        {
            name,
            tags,
            assetCategoryId,
            gameId,
            assetIsSuggestive,
        },
        ctx.env.FILES_BUCKET,
        asset as File
    )

    return ctx.json(
        {
            success: true,
            asset: newAsset,
        },
        200
    )
})

export default handler
