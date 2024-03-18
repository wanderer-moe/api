import { getConnection } from "@/v2/db/turso"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "@hono/zod-openapi"
import { AppHandler } from "../handler"
import { assetComments, assetCommentsLikes } from "@/v2/db/schema"
import { selectAssetCommentsSchema } from "@/v2/db/schema"
import { sql, eq, desc } from "drizzle-orm"

const getCommentRepliesSchema = z.object({
    id: z.string().openapi({
        param: {
            name: "id",
            in: "path",
            description: "The ID of the comment to check replies for.",
            required: true,
        },
    }),
})

const getCommentRepliesOffsetSchema = z.object({
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

const getCommentRepliesResponseSchema = z.object({
    success: z.literal(true),
    replies: z.array(
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

const getCommentsRepliesRoute = createRoute({
    path: "/comment/{id}/replies",
    method: "get",
    summary: "Get a comment's replies",
    description: "Get a comment's replies.",
    tags: ["Asset"],
    request: {
        params: getCommentRepliesSchema,
        query: getCommentRepliesOffsetSchema,
    },
    responses: {
        200: {
            description: "Array of replies to a comment.",
            content: {
                "application/json": {
                    schema: getCommentRepliesResponseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

export const GetCommentsRepliesRoute = (handler: AppHandler) => {
    handler.openapi(getCommentsRepliesRoute, async (ctx) => {
        const commentId = ctx.req.valid("param").id
        const offset = parseInt(ctx.req.valid("query").offset) || 0

        const { drizzle } = await getConnection(ctx.env)

        const replies = await drizzle
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
            .where(eq(assetComments.parentCommentId, commentId))
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
                replies: replies.map((reply) => ({
                    ...reply,
                    hasReplies: !!reply.hasReplies,
                })),
            },
            200
        )
    })
}
