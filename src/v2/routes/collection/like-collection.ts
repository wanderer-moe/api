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
            description: "The id of the collection to like.",
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
    path: "/{id}/like",
    method: "post",
    summary: "Like a collection",
    description: "Like a collection from their ID.",
    tags: ["Collection"],
    request: {
        params: paramsSchema,
    },
    responses: {
        200: {
            description: "True if the collection was liked.",
            content: {
                "application/json": {
                    schema: responseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

export const LikeCollectionByIdRoute = (handler: AppHandler) => {
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
            // i don't know the best way to handle the logic for this,
            // so i'm just rolling with completely disabling liking for private collections
            // in the case that it is private and there's contributors, too bad i guess LOL
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

        if (collectionLikeStatus) {
            return ctx.json(
                {
                    success: false,
                    message: "Collection already liked",
                },
                400
            )
        }

        await drizzle.insert(userCollectionLikes).values({
            collectionId: assetId,
            likedById: user.id,
        })

        return ctx.json(
            {
                success: true,
            },
            200
        )
    })
}
