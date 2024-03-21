import { AppHandler } from "../handler"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "@hono/zod-openapi"
import { getConnection } from "@/v2/db/turso"
import { asset, assetComments } from "@/v2/db/schema"
import { eq } from "drizzle-orm"

const requestBodySchema = z.object({
    comment: z.string().min(3).max(128).openapi({
        description: "The comment to post.",
        example: "This is a comment.",
    }),
})

const pathSchema = z.object({
    id: z.string().openapi({
        param: {
            name: "id",
            in: "path",
            description: "The ID of the asset/comment to comment on.",
            required: true,
        },
    }),
})

const responseSchema = z.object({
    success: z.literal(true),
})

const openRoute = createRoute({
    path: "/comment/{id}/comment",
    method: "post",
    summary: "Post comment or reply.",
    description: "Accepts Asset IDs or Comment IDs.",
    tags: ["Asset"],
    request: {
        params: pathSchema,
        body: {
            content: {
                "application/json": {
                    schema: requestBodySchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Returns true if the comment was posted.",
            content: {
                "application/json": {
                    schema: responseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

export const CommentRoute = (handler: AppHandler) => {
    handler.openapi(openRoute, async (ctx) => {
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

        const { id } = ctx.req.valid("param")
        const { comment } = ctx.req.valid("json")

        const isAsset = id.length === 15
        const isComment = id.length === 20

        const { drizzle } = await getConnection(ctx.env)

        if (isAsset) {
            const validAsset = await drizzle
                .select({
                    id: asset.id,
                })
                .from(asset)
                .where(eq(asset.id, id))

            if (!validAsset) {
                return ctx.json(
                    {
                        success: false,
                        message: "Invalid asset ID",
                    },
                    400
                )
            }
        }

        if (isComment) {
            const validComment = await drizzle
                .select({
                    id: assetComments.id,
                })
                .from(assetComments)
                .where(eq(assetComments.id, id))

            if (!validComment) {
                return ctx.json(
                    {
                        success: false,
                        message: "Invalid comment ID",
                    },
                    400
                )
            }
        }

        await drizzle.insert(assetComments).values({
            assetId: isAsset ? id : null,
            parentCommentId: isComment ? id : null,
            comment: comment,
            commentedById: user.id,
        })

        return ctx.json(
            {
                success: true,
            },
            200
        )
    })
}
