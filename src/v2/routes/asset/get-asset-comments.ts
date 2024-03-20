import { getConnection } from "@/v2/db/turso"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "@hono/zod-openapi"
import { AppHandler } from "../handler"
import { asset, assetComments, assetCommentsLikes } from "@/v2/db/schema"
import { selectAssetCommentsSchema } from "@/v2/db/schema"
import { sql, eq, desc } from "drizzle-orm"

const pathSchema = z.object({
    id: z.string().openapi({
        param: {
            name: "id",
            in: "path",
            description: "The ID of the asset to retrieve.",
            required: true,
        },
    }),
})

const querySchema = z.object({
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

const responseSchema = z.object({
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
                hasReplies: z.boolean(),
                likes: z.number(),
            })
    ),
})

const openRoute = createRoute({
    path: "/{id}/comments",
    method: "get",
    summary: "Get an asset's comments",
    description: "Get an asset's comments.",
    tags: ["Asset"],
    request: {
        params: pathSchema,
        query: querySchema,
    },
    responses: {
        200: {
            description: "Array of your asset comments.",
            content: {
                "application/json": {
                    schema: responseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

export const ViewAssetCommentsRoute = (handler: AppHandler) => {
    handler.openapi(openRoute, async (ctx) => {
        const assetId = ctx.req.valid("param").id
        const offset = parseInt(ctx.req.valid("query").offset) || 0

        const { drizzle } = await getConnection(ctx.env)

        const [assetAllowsComments] = await drizzle
            .select({
                allowComments: asset.allowComments,
            })
            .from(asset)
            .where(eq(asset.id, assetId))
            .limit(1)

        if (assetAllowsComments.allowComments) {
            return ctx.json(
                {
                    success: false,
                    message: "Comments are locked for this asset.",
                },
                403
            )
        }

        const comments = await drizzle
            .select({
                id: assetComments.id,
                parentCommentId: assetComments.parentCommentId,
                commentedById: assetComments.commentedById,
                comment: assetComments.comment,
                createdAt: assetComments.createdAt,
                hasReplies: sql`EXISTS (SELECT 1 FROM assetComments AS ac WHERE ac.parent_comment_id = ${assetComments.id})`,
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
                comments: comments.map((c) => ({
                    ...c,
                    hasReplies: !!c.hasReplies,
                })),
            },
            200
        )
    })
}
