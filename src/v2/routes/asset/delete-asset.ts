import { OpenAPIHono } from "@hono/zod-openapi"
import { getConnection } from "@/v2/db/turso"
import { eq } from "drizzle-orm"
import { asset } from "@/v2/db/schema"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "@hono/zod-openapi"

const deleteAssetByIdSchema = z.object({
    id: z.string().openapi({
        param: {
            name: "id",
            in: "path",
            description: "The ID of the asset to delete.",
            example: "1",
            required: true,
        },
    }),
})

const deleteAssetByIdResponseSchema = z.object({
    success: z.literal(true),
})

const deleteAssetByIdRoute = createRoute({
    path: "/{id}",
    method: "delete",
    description:
        "Delete an asset from their ID. Must be the owner of the asset or an admin.",
    tags: ["Asset"],
    request: {
        params: deleteAssetByIdSchema,
    },
    responses: {
        200: {
            description: "True if the asset was deleted.",
            content: {
                "application/json": {
                    schema: deleteAssetByIdResponseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(deleteAssetByIdRoute, async (ctx) => {
    const assetId = ctx.req.valid("param").id

    const { drizzle } = await getConnection(ctx.env)

    const [existingAsset] = await drizzle
        .select({ id: asset.id })
        .from(asset)
        .where(eq(asset.id, parseInt(assetId)))
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

    await drizzle.delete(asset).where(eq(asset.id, parseInt(assetId)))
    // await ctx.env.FILES_BUCKET.delete(asset.url)

    return ctx.json(
        {
            success: true,
        },
        200
    )
})

export default handler