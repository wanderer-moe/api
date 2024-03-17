import type { AppHandler } from "../handler"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"
import { getConnection } from "@/v2/db/turso"
import { SplitQueryByCommas } from "@/v2/lib/helpers/split-query-by-commas"
import { assetTagAsset } from "@/v2/db/schema"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "@hono/zod-openapi"

const AcceptedImageType = "image/png"
const MaxFileSize = 5 * 1024 * 1024

const uploadAssetSchema = z.object({
    asset: z
        .any()
        .openapi({
            description: "The image of the asset to upload.",
            example: "asset",
        })
        .refine((files) => files?.length == 1, "An image is required.")
        .refine(
            (files) => files?.[0]?.size <= MaxFileSize,
            `Max file size is 5MB)`
        )
        .refine(
            (files) => files?.[0]?.type === AcceptedImageType,
            `Only ${AcceptedImageType} is accepted.`
        ),
    name: z.string().min(3).max(32).openapi({
        description: "The name of the asset.",
        example: "keqing-nobg.png",
    }),
    tags: z
        .string()
        .openapi({
            description: "Comma seperated list of tags for the asset.",
            example: "official,1.0",
        })
        .optional(),
    assetCategoryId: z.string().openapi({
        description: "The asset category ID for the asset.",
        example: "splash-art",
    }),
    gameId: z.string().openapi({
        description: "The game ID for the asset.",
        example: "genshin-impact",
    }),
    assetIsSuggestive: z
        .string()
        .min(1)
        .max(1)
        .openapi({
            description:
                "If the asset contains suggestive content. 1 = Yes, 0 = No.",
            example: "1",
        })
        .transform((value) => parseInt(value))
        .refine((value) => value === 1 || value === 0),
})

const uploadAssetResponseSchema = z.object({
    success: z.literal(true),
})

const uploadAssetRoute = createRoute({
    path: "/upload",
    method: "post",
    description: "Upload a new asset.",
    tags: ["Asset"],
    request: {
        body: {
            content: {
                "multipart/form-data": {
                    schema: uploadAssetSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "The uploaded asset.",
            content: {
                "application/json": {
                    schema: uploadAssetResponseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

export const UploadAssetRoute = (handler: AppHandler) =>
    handler.openapi(uploadAssetRoute, async (ctx) => {
        const {
            asset,
            name,
            tags,
            assetCategoryId,
            gameId,
            assetIsSuggestive,
        } = ctx.req.valid("form")

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

        const { key } = await ctx.env.FILES_BUCKET.put(
            `/assets/${gameId}/${assetCategoryId}/${name}.png`,
            asset
        )

        const createdAsset = await drizzle
            .insert(asset)
            .values({
                name: name,
                extension: "png",
                gameId: gameId,
                assetCategoryId: assetCategoryId,
                url: key,
                uploadedByName: user.username,
                uploadedById: user.id,
                status: "pending",
                fileSize: 0,
                width: 0,
                height: 0,
                assetIsSuggestive: Boolean(assetIsSuggestive),
            })
            .returning()

        const tagsSplit = SplitQueryByCommas(tags) ?? []

        if (tagsSplit.length > 0) {
            const tagBatchQueries = tagsSplit.map((tag) =>
                drizzle.insert(assetTagAsset).values({
                    assetId: createdAsset[0].id,
                    assetTagId: tag,
                })
            )

            type TagBatchQuery = (typeof tagBatchQueries)[number]
            await drizzle.batch(
                tagBatchQueries as [TagBatchQuery, ...TagBatchQuery[]]
            )
        }

        return ctx.json(
            {
                success: true,
            },
            200
        )
    })
