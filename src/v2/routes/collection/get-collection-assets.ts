import { AppHandler } from "../handler"
import { getConnection } from "@/v2/db/turso"
import {
    userCollection,
    userCollectionCollaborators,
    selectUserCollectionAssetSchema,
    selectAssetSchema,
} from "@/v2/db/schema"
import { and, eq } from "drizzle-orm"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "@hono/zod-openapi"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"

const paramsSchema = z.object({
    id: z.string().openapi({
        param: {
            name: "id",
            in: "path",
            description: "The ID of the collection to retrieve.",
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
    assets: z.array(
        selectUserCollectionAssetSchema
            .pick({ order: true, dateAdded: true })
            .extend({
                asset: selectAssetSchema.pick({
                    id: true,
                    name: true,
                    extension: true,
                    url: true,
                    viewCount: true,
                    downloadCount: true,
                    uploadedDate: true,
                    fileSize: true,
                    width: true,
                    height: true,
                }),
            })
    ),
})

const openRoute = createRoute({
    path: "/{id}/assets",
    method: "get",
    summary: "Get a collection's assets",
    description:
        "Get a collection's assets by its ID. Returns 50 per request. If you do not have access to the collection (it is private/you do not have edit permission), it will not be returned.",
    tags: ["Collection"],
    request: {
        params: paramsSchema,
        query: querySchema,
    },
    responses: {
        200: {
            description: "Asset information",
            content: {
                "application/json": {
                    schema: responseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

export const GetCollectionAssetsByIdRoute = (handler: AppHandler) => {
    handler.openapi(openRoute, async (ctx) => {
        const { id } = ctx.req.valid("param")
        const { offset } = ctx.req.valid("query")

        const { drizzle } = await getConnection(ctx.env)

        const [validCollection] = await drizzle
            .select({
                id: userCollection.id,
                userId: userCollection.userId,
                isPublic: userCollection.isPublic,
            })
            .from(userCollection)
            .where(eq(userCollection.id, id))

        if (!validCollection) {
            return ctx.json(
                {
                    success: false,
                    message: "Collection not found",
                },
                404
            )
        }

        const authSessionManager = new AuthSessionManager(ctx)

        const { user } = await authSessionManager.validateSession()

        if (!validCollection.isPublic) {
            if (!user) {
                return ctx.json(
                    {
                        success: false,
                        message: "Unauthorized",
                    },
                    401
                )
            }

            const [collaborator] = await drizzle
                .select()
                .from(userCollectionCollaborators)
                .where(
                    and(
                        eq(userCollectionCollaborators.collectionId, id),
                        eq(userCollectionCollaborators.collaboratorId, user.id)
                    )
                )

            if (!collaborator && validCollection.userId != user.id) {
                return ctx.json(
                    {
                        success: false,
                        message: "Unauthorized",
                    },
                    401
                )
            }
        }

        const collectionAssets =
            await drizzle.query.userCollectionAsset.findMany({
                columns: {
                    collectionId: true,
                    order: true,
                    dateAdded: true,
                },
                where: (userCollectionAsset) =>
                    eq(userCollectionAsset.collectionId, id),
                with: {
                    asset: {
                        columns: {
                            id: true,
                            name: true,
                            extension: true,
                            url: true,
                            viewCount: true,
                            downloadCount: true,
                            uploadedDate: true,
                            fileSize: true,
                            width: true,
                            height: true,
                        },
                    },
                },
                offset: parseInt(offset) || 0,
                limit: 50,
                orderBy: (userCollectionAsset, { asc }) => [
                    asc(userCollectionAsset.order),
                ],
            })

        return ctx.json(
            {
                success: true,
                assets: collectionAssets,
            },
            200
        )
    })
}
