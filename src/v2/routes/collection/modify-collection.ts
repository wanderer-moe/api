import { getConnection } from "@/v2/db/turso"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"
import { selectUserCollectionSchema, userCollection } from "@/v2/db/schema"
import { and, eq } from "drizzle-orm"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "@hono/zod-openapi"
import { AppHandler } from "../handler"
import { ColourType } from "@/v2/lib/colour"

const paramsSchema = z.object({
    id: z.string().openapi({
        param: {
            description: "The id of the collection to modify.",
            example: "collection_id",
            in: "path",
            required: true,
        },
    }),
})

const requestBodySchema = z.object({
    name: z.string().min(1).max(32).optional(),
    description: z.string().min(1).max(256).optional(),
    isPublic: z.number().int().min(0).max(1).optional(),
    accentColour: z.string().length(7).optional(),
})

const responseSchema = z.object({
    success: z.literal(true),
    collection: selectUserCollectionSchema,
})

const openRoute = createRoute({
    path: "/{id}/modify",
    method: "patch",
    summary: "Modify a collection",
    description:
        "Modify an existing collection, you must be the owner of the collection to modify these details..",
    tags: ["Collection"],
    request: {
        params: paramsSchema,
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
            description: "Returns the collection's new attributes",
            content: {
                "application/json": {
                    schema: responseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

export const ModifyCollectionRoute = (handler: AppHandler) => {
    handler.openapi(openRoute, async (ctx) => {
        const { name, description, isPublic, accentColour } =
            ctx.req.valid("json")

        const { id } = ctx.req.valid("param")

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

        const { drizzle } = await getConnection(ctx.env)

        const [collection] = await drizzle
            .select({
                id: userCollection.id,
                isPublic: userCollection.isPublic,
                userId: userCollection.userId,
            })
            .from(userCollection)
            .where(
                and(
                    eq(userCollection.id, id),
                    eq(userCollection.userId, user.id)
                )
            )

        if (!collection || collection.isPublic) {
            return ctx.json(
                {
                    success: false,
                    message: "Collection not found",
                },
                404
            )
        }

        if (collection.userId !== user.id) {
            return ctx.json(
                {
                    success: false,
                    message:
                        "Unauthorized. You are not the owner of this collection.",
                },
                401
            )
        }

        const [updatedCollection] = await drizzle
            .update(userCollection)
            .set({
                name: name,
                description: description,
                isPublic: Boolean(isPublic),
                accentColour: accentColour as ColourType,
            })
            .where(eq(userCollection.id, id))
            .returning()

        return ctx.json(
            {
                success: true,
                collection: updatedCollection,
            },
            200
        )
    })
}
