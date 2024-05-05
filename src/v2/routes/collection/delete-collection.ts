import { AppHandler } from "../handler"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "@hono/zod-openapi"
import { getConnection } from "@/v2/db/turso"
import { userCollection } from "@/v2/db/schema"
import { eq } from "drizzle-orm"

const pathSchema = z.object({
    id: z.string().openapi({
        param: {
            name: "id",
            in: "path",
            description: "The ID of the collection to delete.",
            required: true,
        },
    }),
})

const responseSchema = z.object({
    success: z.literal(true),
})

const openRoute = createRoute({
    path: "/collection/{id}/delete",
    method: "post",
    summary: "Delete a collection.",
    description:
        "Delete a collection. Only the owner of the collection can delete it.",
    tags: ["Collection"],
    request: {
        params: pathSchema,
    },
    responses: {
        200: {
            description:
                "Returns true if the collection was deleted successfully.",
            content: {
                "application/json": {
                    schema: responseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

export const DeleteCollectionRoute = (handler: AppHandler) => {
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

        const { drizzle } = await getConnection(ctx.env)

        const [existingCollection] = await drizzle
            .select().from(userCollection)
        
        if (!existingCollection) {
            return ctx.json(
                {
                    success: false,
                    message: "Collection not found.",
                },
                404
            )
        }

        if (existingCollection.userId !== user.id) {
            return ctx.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                401
            )
        }

        await drizzle.delete(userCollection).where(eq(userCollection.id, id))
        
        return ctx.json(
            {
                success: true,
            },
            200
        )
    })
}
