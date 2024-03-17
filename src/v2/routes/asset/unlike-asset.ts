import { getConnection } from "@/v2/db/turso"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"
import { asset, assetLikes } from "@/v2/db/schema"
import { and, eq } from "drizzle-orm"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "@hono/zod-openapi"
import type { AppHandler } from "../handler"

const unlikeAssetByIdSchema = z.object({
    id: z.string().openapi({
        param: {
            description: "The id of the asset to unlike.",
            example: "asset_id",
            in: "path",
            name: "id",
            required: true,
        },
    }),
})

const unlikeAssetByIdResponseSchema = z.object({
    success: z.literal(true),
})

const unlikeAssetByIdRoute = createRoute({
    path: "/{id}/unlike",
    method: "post",
    summary: "Unlike an asset",
    description: "Unlike an asset from their ID.",
    tags: ["Asset"],
    request: {
        params: unlikeAssetByIdSchema,
    },
    responses: {
        200: {
            description: "True if the asset was unliked.",
            content: {
                "application/json": {
                    schema: unlikeAssetByIdResponseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

export const UnlikeAssetByIdRoute = (handler: AppHandler) => {
    handler.openapi(unlikeAssetByIdRoute, async (ctx) => {
        const assetId = ctx.req.valid("param").id

        const { drizzle } = await getConnection(ctx.env)

        const [existingAsset] = await drizzle
            .select()
            .from(asset)
            .where(eq(asset.id, assetId))
            .limit(1)

        if (!existingAsset) {
            return ctx.json(
                {
                    success: true,
                    message: "Asset not found",
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

        const [assetLikeStatus] = await drizzle
            .select({ assetId: assetLikes.assetId })
            .from(assetLikes)
            .where(
                and(
                    eq(assetLikes.assetId, assetId),
                    eq(assetLikes.likedById, user.id)
                )
            )
            .limit(1)

        if (!assetLikeStatus) {
            return ctx.json(
                {
                    success: false,
                    message: "You have not liked this asset",
                },
                400
            )
        }

        await drizzle
            .delete(assetLikes)
            .where(
                and(
                    eq(assetLikes.assetId, assetId),
                    eq(assetLikes.likedById, user.id)
                )
            )

        return ctx.json(
            {
                success: true,
            },
            200
        )
    })
}
