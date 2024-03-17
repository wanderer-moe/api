import { Handler } from "../handler"
import { getConnection } from "@/v2/db/turso"
import { asset } from "@/v2/db/schema"
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
    asset: selectAssetSchema.extend({
        assetTagAsset: z.array(
            selectAssetTagAssetSchema.extend({
                assetTag: selectAssetTagSchema,
            })
        ),
    }),
    authUser: selectUserSchema.pick({
        id: true,
        avatarUrl: true,
        displayName: true,
        username: true,
        usernameColour: true,
        pronouns: true,
        verified: true,
        bio: true,
        dateJoined: true,
        plan: true,
        role: true,
    }),
    game: selectGameSchema,
    assetCategory: selectAssetCategorySchema,
    // similarAssets: selectAssetSchema.array(),
})

const getAssetByIdRoute = createRoute({
    path: "/{id}",
    method: "get",
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

export const GetAssetByIdRoute = (handler: Handler) => {
    handler.openapi(getAssetByIdRoute, async (ctx) => {
        const assetId = ctx.req.valid("param").id

        const { drizzle } = await getConnection(ctx.env)

        const foundAsset = await drizzle.query.asset.findFirst({
            where: (asset, { eq }) => eq(asset.id, parseInt(assetId)),
            with: {
                assetTagAsset: {
                    with: {
                        assetTag: true,
                    },
                },
                authUser: {
                    columns: {
                        id: true,
                        avatarUrl: true,
                        displayName: true,
                        username: true,
                        usernameColour: true,
                        pronouns: true,
                        verified: true,
                        bio: true,
                        dateJoined: true,
                        plan: true,
                        role: true,
                    },
                },
                game: true,
                assetCategory: true,
            },
        })

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
            .where(eq(asset.id, parseInt(assetId)))

        return ctx.json(
            {
                success: true,
                asset: foundAsset,
            },
            200
        )
    })
}
