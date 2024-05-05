import { type AppHandler } from "../handler"
import { getConnection } from "@/v2/db/turso"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"
import { userCollection, userCollectionLikes } from "@/v2/db/schema"
import { and, eq } from "drizzle-orm"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "@hono/zod-openapi"

const paramsSchema = z.object({
    id: z.string().openapi({
        param: {
            description: "The id of the collection to unlike.",
            example: "collection_id",
            in: "path",
            name: "id",
            required: true,
        },
    }),
})

const responseSchema = z.object({
    success: z.literal(true),
})

const openRoute = createRoute({
    path: "/{id}/unlike",
    method: "post",
    summary: "Unlike a collection",
    description: "Unlike a collection from their ID.",
    tags: ["Collection"],
    request: {
        params: paramsSchema,
    },
    responses: {
        200: {
            description: "True if the collection was unliked.",
            content: {
                "application/json": {
                    schema: responseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

export const UnlikeCollectionByIDRoute = (handler: AppHandler) => {
    handler.openapi(openRoute, async (ctx) => {
        const assetId = ctx.req.valid("param").id

        const { drizzle } = await getConnection(ctx.env)

        const authSessionManager = new AuthSessionManager(ctx)

        const { user } = await authSessionManager.validateSession()

        const [existingCollection] = await drizzle
            .select()
            .from(userCollection)
            .where(eq(userCollection.id, assetId))
            .limit(1)

        if (
            !existingCollection ||
            (!existingCollection.isPublic &&
                existingCollection.userId !== user.id)
        ) {
            return ctx.json(
                {
                    success: false,
                    message: "Collection not found",
                },
                404
            )
        }

        const [collectionLikeStatus] = await drizzle
            .select()
            .from(userCollectionLikes)
            .where(
                and(
                    eq(userCollectionLikes.collectionId, assetId),
                    eq(userCollectionLikes.likedById, user.id)
                )
            )
            .limit(1)

        if (!collectionLikeStatus) {
            return ctx.json(
                {
                    success: false,
                    message: "Collection not liked",
                },
                400
            )
        }

        await drizzle
            .delete(userCollectionLikes)
            .where(
                and(
                    eq(userCollectionLikes.collectionId, assetId),
                    eq(userCollectionLikes.likedById, user.id)
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
