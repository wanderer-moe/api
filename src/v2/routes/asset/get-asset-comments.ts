import { getConnection } from "@/v2/db/turso"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "@hono/zod-openapi"
import { AppHandler } from "../handler"
import { assetComments, assetCommentsLikes } from "@/v2/db/schema"
import { selectAssetCommentsSchema } from "@/v2/db/schema"
import { sql, eq, desc } from "drizzle-orm"

const getAssetCommentsSchema = z.object({
    id: z.string().openapi({
        param: {
            name: "id",
            in: "path",
            description: "The ID of the asset to retrieve.",
            required: true,
        },
    }),
})

const getAssetCommentsOffsetSchema = z.object({
    offset: z
        .string()
        .optional()
        .openapi({
            param: {
                name: "offset",
                in: "query",
                description: "The offset to start from.",
                required: false,
            },
        }),
})

const getAssetCommentsResponseSchema = z.object({
    success: z.literal(true),
    comments: z.array(
        selectAssetCommentsSchema
            .pick({
                id: true,
                parentCommentId: true,
                commentedById: true,
                comment: true,
                createdAt: true,
            })
            .extend({
                likes: z.number(),
            })
    ),
})

const getAssetCommentsRoute = createRoute({
    path: "/{id}/comments",
    method: "get",
    description: "Get an asset's comments.",
    tags: ["Asset"],
    request: {
        params: getAssetCommentsSchema,
        query: getAssetCommentsOffsetSchema,
    },
    responses: {
        200: {
            description: "Array of your asset comments.",
            content: {
                "application/json": {
                    schema: getAssetCommentsResponseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

export const ViewAssetCommentsRoute = (handler: AppHandler) => {
    handler.openapi(getAssetCommentsRoute, async (ctx) => {
        const assetId = ctx.req.valid("param").id
        const offset = parseInt(ctx.req.valid("query").offset) || 0

        const { drizzle } = await getConnection(ctx.env)

        const comments = await drizzle
            .select({
                id: assetComments.id,
                parentCommentId: assetComments.parentCommentId,
                commentedById: assetComments.commentedById,
                comment: assetComments.comment,
                createdAt: assetComments.createdAt,
                likes: sql`COUNT(${assetCommentsLikes.commentId})`,
            })
            .from(assetComments)
            .where(eq(assetComments.assetId, assetId))
            .leftJoin(
                assetCommentsLikes,
                eq(assetComments.id, assetCommentsLikes.commentId)
            )
            .groupBy(assetComments.id)
            .offset(offset)
            .limit(10)
            .orderBy(desc(assetComments.createdAt))

        return ctx.json(
            {
                success: true,
                comments,
            },
            200
        )
    })
}
