import { OpenAPIHono } from "@hono/zod-openapi"
import { getConnection } from "@/v2/db/turso"
import { modifyAssetRoute } from "./openapi"
import { roleFlagsToArray } from "@/v2/lib/helpers/role-flags"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"
import { AssetManager } from "@/v2/lib/managers/asset/asset-manager"
import { asset } from "@/v2/db/schema"
import { eq } from "drizzle-orm"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(modifyAssetRoute, async (ctx) => {
    const { id, name, tags, assetCategoryId, gameId } = ctx.req.valid("json")

    if (isNaN(parseInt(id))) {
        return ctx.json(
            {
                success: false,
                message: "Invalid asset ID",
            },
            400
        )
    }

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

    const { drizzle } = getConnection(ctx.env)
    const assetManager = new AssetManager(drizzle)

    const [assetUser] = await drizzle
        .select({
            uploadedById: asset.uploadedById,
        })
        .from(asset)
        .where(eq(asset.id, parseInt(id)))

    if (
        assetUser.uploadedById !== user.id ||
        !roleFlagsToArray(user.roleFlags).includes("DEVELOPER")
    ) {
        return ctx.json(
            {
                success: false,
                message: "Unauthorized",
            },
            401
        )
    }

    const updatedAsset = await assetManager.updateAssetById(parseInt(id), {
        name,
        tags,
        assetCategoryId,
        gameId,
    })

    return ctx.json(
        {
            success: true,
            asset: updatedAsset,
        },
        200
    )
})

export default handler
