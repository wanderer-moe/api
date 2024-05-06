import { AppHandler } from "../handler"
import { getConnection } from "@/v2/db/turso"
import { userCollection, userCollectionCollaborators } from "@/v2/db/schema"
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
            description: "The ID of the collection to add contributor to",
            required: true,
        },
    }),
    contributorId: z.string().openapi({
        param: {
            name: "contributorId",
            in: "path",
            description: "The user ID of the contribitor to add.",
            required: true,
        },
    }),
})

const responseSchema = z.object({
    success: z.literal(true),
})

const openRoute = createRoute({
    path: "/{id}/contributor/{contributorId}/add",
    method: "post",
    summary: "Add contributor to collection",
    description:
        "Add a contributor to a collection, you must be the collection owner to add a contributor.",
    tags: ["Collection"],
    request: {
        params: paramsSchema,
    },
    responses: {
        200: {
            description:
                "Returns true if the contributor was added to the collection.",
            content: {
                "application/json": {
                    schema: responseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

export const AddContributorToCollectionRoute = (handler: AppHandler) => {
    handler.openapi(openRoute, async (ctx) => {
        const { id, contributorId } = ctx.req.valid("param")
        const { drizzle } = await getConnection(ctx.env)

        const authSessionManager = new AuthSessionManager(ctx)
        const { user } = await authSessionManager.validateSession()

        const [existingCollection] = await drizzle
            .select({
                id: userCollection.id,
                userId: userCollection.userId,
            })
            .from(userCollection)
            .where(eq(userCollection.id, id))

        if (!existingCollection || existingCollection.userId !== user.id) {
            return ctx.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                401
            )
        }

        const [contributor] = await drizzle
            .select({
                collectionId: userCollectionCollaborators.collectionId,
                collaboratorId: userCollectionCollaborators.collaboratorId,
            })
            .from(userCollectionCollaborators)
            .where(
                and(
                    eq(userCollectionCollaborators.collectionId, id),
                    eq(
                        userCollectionCollaborators.collaboratorId,
                        contributorId
                    )
                )
            )
            .limit(1)

        if (contributor) {
            return ctx.json(
                {
                    success: false,
                    message: "Contributor already exists",
                },
                400
            )
        }

        await drizzle.insert(userCollectionCollaborators).values({
            collectionId: id,
            collaboratorId: contributorId,
        })

        return ctx.json(
            {
                success: true,
            },
            200
        )
    })
}
