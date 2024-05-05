import { AppHandler } from "../handler"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "@hono/zod-openapi"
import { getConnection } from "@/v2/db/turso"
import { selectUserCollectionSchema, userCollection } from "@/v2/db/schema"
import { ColourType } from "@/v2/lib/colour"

const requestBodySchema = z.object({
    name: z.string().min(1).max(32),
    description: z.string().min(1).max(256),
    isPublic: z.number().int().min(0).max(1),
    accentColour: z.string().length(7).optional(), // hex
})

const responseSchema = z.object({
    success: z.literal(true),
    collection: selectUserCollectionSchema,
})

const openRoute = createRoute({
    path: "/collection/create",
    method: "post",
    summary: "Create a new collection",
    description:
        "Create a new collection, accent colours available for supporters",
    tags: ["Collection"],
    request: {
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
            description:
                "Returns the collection + true if the collection was made.",
            content: {
                "application/json": {
                    schema: responseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

export const CreateCollectionRoute = (handler: AppHandler) => {
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

        const { name, description, isPublic, accentColour } =
            ctx.req.valid("json")

        const { drizzle } = await getConnection(ctx.env)

        const [newCollection] = await drizzle
            .insert(userCollection)
            .values({
                name: name,
                userId: user.id,
                description: description,
                isPublic: Boolean(isPublic),
                accentColour: accentColour as ColourType,
            })
            .returning()

        return ctx.json(
            {
                success: true,
                collection: newCollection,
            },
            200
        )
    })
}
