import { AppHandler } from "../handler"
import { getConnection } from "@/v2/db/turso"
import { asset } from "@/v2/db/schema"
import { eq, sql } from "drizzle-orm"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "@hono/zod-openapi"

const downloadAssetByIdSchema = z.object({
    id: z.string().openapi({
        param: {
            name: "id",
            in: "path",
            description: "The ID of the asset to retrieve.",
            required: true,
        },
    }),
})

const downloadAssetByIdResponseSchema = z.object({
    success: z.literal(true),
    downloadUrl: z.string(),
})

const downloadAssetByIdRoute = createRoute({
    path: "/{id}/download",
    method: "get",
    description: "Download an asset by their ID.",
    tags: ["Asset"],
    request: {
        params: downloadAssetByIdSchema,
    },
    responses: {
        200: {
            description: "Asset downloaded successfully.",
            response: {
                content: {
                    "application/json": {
                        schema: downloadAssetByIdResponseSchema,
                    },
                },
            },
        },
        ...GenericResponses,
    },
})

export const DownloadAssetRoute = (handler: AppHandler) => {
    handler.openapi(downloadAssetByIdRoute, async (ctx) => {
        const assetId = ctx.req.valid("param").id

        const { drizzle } = await getConnection(ctx.env)

        const [foundAsset] = await drizzle
            .select({
                url: asset.url,
            })
            .from(asset)
            .where(eq(asset.id, assetId))
            .limit(1)

        if (!foundAsset) {
            return ctx.json(
                {
                    success: false,
                    message: "Asset not found",
                },
                404
            )
        }

        await drizzle
            .update(asset)
            .set({
                viewCount: sql`${asset.downloadCount} + 1`,
            })
            .where(eq(asset.id, assetId))

        return ctx.json({
            success: true,
            downloadUrl: foundAsset.url,
        })
    })
}
