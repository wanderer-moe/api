import { AppHandler } from "../handler"
import { getConnection } from "@/v2/db/turso"
import { asset, assetLikes } from "@/v2/db/schema"
import { eq, sql } from "drizzle-orm"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "@hono/zod-openapi"
import {
    selectAssetCategorySchema,
    selectGameSchema,
    selectAssetSchema,
    selectAssetTagAssetSchema,
    selectAssetTagSchema,
    selectUserSchema,
} from "@/v2/db/schema"

const getAssetByIdSchema = z.object({
    id: z.string().openapi({
        param: {
            name: "id",
            in: "path",
            description: "The ID of the asset to retrieve.",
            required: true,
        },
    }),
})

const getAssetByIdResponseSchema = z.object({
    success: z.literal(true),
    // mmm nested schemas
    asset: selectAssetSchema
        .pick({
            id: true,
            name: true,
            extension: true,
            url: true,
            viewCount: true,
            downloadCount: true,
            fileSize: true,
            width: true,
            height: true,
        })
        .extend({
            assetTagAsset: z.array(
                selectAssetTagAssetSchema.pick({}).extend({
                    assetTag: selectAssetTagSchema.pick({
                        id: true,
                        formattedName: true,
                    }),
                })
            ),
            authUser: selectUserSchema.pick({
                id: true,
                avatarUrl: true,
                displayName: true,
                username: true,
                usernameColour: true,
                plan: true,
                role: true,
            }),
            game: selectGameSchema.pick({
                id: true,
                formattedName: true,
            }),
            assetCategory: selectAssetCategorySchema.pick({
                id: true,
                formattedName: true,
            }),
        }),
    assetLikes: z.number(),
})

const getAssetByIdRoute = createRoute({
    path: "/{id}",
    method: "get",
    summary: "Get an asset",
    description: "Get an asset by their ID.",
    tags: ["Asset"],
    request: {
        params: getAssetByIdSchema,
    },
    responses: {
        200: {
            description: "The found asset & similar assets are returned.",
            content: {
                "application/json": {
                    schema: getAssetByIdResponseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

export const GetAssetByIdRoute = (handler: AppHandler) => {
    handler.openapi(getAssetByIdRoute, async (ctx) => {
        const assetId = ctx.req.valid("param").id

        const { drizzle } = await getConnection(ctx.env)

        const foundAsset = await drizzle.query.asset.findFirst({
            columns: {
                id: true,
                name: true,
                extension: true,
                url: true,
                viewCount: true,
                downloadCount: true,
                fileSize: true,
                width: true,
                height: true,
            },
            where: (asset, { eq }) => eq(asset.id, assetId),
            with: {
                assetTagAsset: {
                    columns: {
                        assetTagId: false,
                        assetId: false,
                    },
                    with: {
                        assetTag: {
                            columns: {
                                id: true,
                                formattedName: true,
                            },
                        },
                    },
                },
                authUser: {
                    columns: {
                        id: true,
                        avatarUrl: true,
                        displayName: true,
                        username: true,
                        usernameColour: true,
                        plan: true,
                        role: true,
                    },
                },
                game: {
                    columns: {
                        id: true,
                        formattedName: true,
                    },
                },
                assetCategory: {
                    columns: {
                        id: true,
                        formattedName: true,
                    },
                },
            },
        })

        const [totalAssetLikes] = await drizzle
            .select({
                likeCount: sql<number>`COUNT(${assetLikes.assetId})`,
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
                400
            )
        }

        await drizzle
            .update(asset)
            .set({
                viewCount: sql`${asset.viewCount} + 1`,
            })
            .where(eq(asset.id, assetId))

        return ctx.json(
            {
                success: true,
                asset: foundAsset,
                assetLikes: totalAssetLikes.likeCount,
            },
            200
        )
    })
}
