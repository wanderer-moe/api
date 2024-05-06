import { AppHandler } from "../handler"
import { getConnection } from "@/v2/db/turso"
import {
    userCollection,
    userCollectionCollaborators,
    asset,
    userCollectionAsset,
} from "@/v2/db/schema"
import { and, desc, eq, not } from "drizzle-orm"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "@hono/zod-openapi"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"

const paramsSchema = z.object({
    id: z.string().openapi({
        param: {
            name: "id",
            in: "path",
            description: "The ID of the collection to add asset to",
            required: true,
        },
    }),
    assetId: z.string().openapi({
        param: {
            name: "assetId",
            in: "path",
            description: "The ID of the asset to add.",
            required: true,
        },
    }),
})

const responseSchema = z.object({
    success: z.literal(true),
})

const openRoute = createRoute({
    path: "/{id}/add/{assetId}",
    method: "post",
    summary: "Add asset to collection",
    description:
        "Add an asset to a collection, you must be the collection owner or a collaborator to add an asset.",
    tags: ["Collection"],
    request: {
        params: paramsSchema,
    },
    responses: {
        200: {
            description:
                "Returns true if the asset was added to the collection.",
            content: {
                "application/json": {
                    schema: responseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

export const AddAssetToCollectionRoute = (handler: AppHandler) => {
    handler.openapi(openRoute, async (ctx) => {
        const { id, assetId } = ctx.req.valid("param")
        const { drizzle } = await getConnection(ctx.env)

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

        const [existingCollection] = await drizzle
            .select({
                id: userCollection.id,
                userId: userCollection.userId,
            })
            .from(userCollection)
            .where(eq(userCollection.id, id))
            .limit(1)

        if (!existingCollection) {
            return ctx.json(
                {
                    success: false,
                    message: "Collection ID provided does not exist",
                },
                404
            )
        }

        const [existingAsset] = await drizzle
            .select({
                id: asset.id,
            })
            .from(asset)
            .where(eq(asset.id, assetId))
            .limit(1)

        if (!existingAsset) {
            return ctx.json(
                {
                    success: false,
                    message: "Asset ID provided does not exist",
                },
                404
            )
        }

        const [existingCollaborator] = await drizzle
            .select({
                role: userCollectionCollaborators.role,
                collaboratorId: userCollectionCollaborators.collaboratorId,
            })
            .from(userCollectionCollaborators)
            .where(
                and(
                    eq(userCollectionCollaborators.collectionId, id),
                    eq(userCollectionCollaborators.collaboratorId, user.id),
                    not(eq(userCollectionCollaborators.role, "viewer"))
                )
            )
            .limit(1)

        if (!existingCollaborator && existingCollection.userId !== user.id) {
            return ctx.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                401
            )
        }

        // check if asset is already in collection

        const [existingAssetInCollection] = await drizzle
            .select({
                collectionId: userCollectionAsset.collectionId,
                assetId: userCollectionAsset.assetId,
            })
            .from(userCollectionAsset)
            .where(
                and(
                    eq(userCollectionAsset.collectionId, id),
                    eq(userCollectionAsset.assetId, assetId)
                )
            )
            .limit(1)

        if (existingAssetInCollection) {
            return ctx.json(
                {
                    success: false,
                    message: "Asset already in collection",
                },
                400
            )
        }

        const [lastOrder] = await drizzle
            .select({
                order: userCollectionAsset.order,
            })
            .from(userCollectionAsset)
            .where(eq(userCollectionAsset.collectionId, id))
            .orderBy(desc(userCollectionAsset.order))
            .limit(1)

        await drizzle.insert(userCollectionAsset).values({
            collectionId: id,
            order: lastOrder ? lastOrder.order + 1 : 0,
            assetId: assetId,
        })

        return ctx.json(
            {
                success: true,
            },
            200
        )
    })
}
