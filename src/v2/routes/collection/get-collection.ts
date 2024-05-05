import { AppHandler } from "../handler"
import { getConnection } from "@/v2/db/turso"
import {
    userCollection,
    userCollectionCollaborators,
    selectUserCollectionSchema,
    selectUserSchema,
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

const responseSchema = z.object({
    success: z.literal(true),
    collection: selectUserCollectionSchema
        .pick({
            id: true,
            name: true,
            accentColour: true,
            isPublic: true,
            userId: true,
        })
        .extend({
            authUser: selectUserSchema.pick({
                id: true,
                avatarUrl: true,
                displayName: true,
                username: true,
                usernameColour: true,
                plan: true,
                role: true,
            }),
        }),
})

const openRoute = createRoute({
    path: "/{id}",
    method: "get",
    summary: "Get a collection",
    description:
        "Get a collection by its ID. If you do not have access to the collection (it is private/you do not have edit permission), it will not be returned.",
    tags: ["Asset"],
    request: {
        params: paramsSchema,
    },
    responses: {
        200: {
            description: "Basic information about the collection is returned.",
            content: {
                "application/json": {
                    schema: responseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

export const GetCollectionByIdRoute = (handler: AppHandler) => {
    handler.openapi(openRoute, async (ctx) => {
        const { id } = ctx.req.valid("param")

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

        const collectionInfo = await drizzle.query.userCollection.findFirst({
            columns: {
                id: true,
                name: true,
                accentColour: true,
                isPublic: true,
                userId: true,
            },
            where: (collection, { eq }) => eq(collection.id, id),
            with: {
                authUser: {
                    columns: {
                        id: true,
                        avatarUrl: true,
                        displayName: true,
                        username: true,
                        usernameColour: true,
                        plan: true,
                        role: true,
                    },
                },
            },
        })

        return ctx.json(
            {
                success: true,
                collection: collectionInfo,
            },
            200
        )
    })
}
