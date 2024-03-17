import { getConnection } from "@/v2/db/turso"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "@hono/zod-openapi"
import { AppHandler } from "../handler"

const getAssetCommentsSchema = z.object({
    id: z.string().openapi({
        param: {
            name: "id",
            in: "path",
            description: "The ID of the asset to retrieve.",
            required: true,
        },
    }),
})

const getAssetCommentsResponseSchema = z.object({
    success: z.literal(true),
})

const getAssetCommentsRoute = createRoute({
    path: "/{id}/comments",
    method: "get",
    description: "Get an asset's comments.",
    tags: ["Asset"],
    request: {
        params: getAssetCommentsSchema,
    },
    responses: {
        200: {
            description: "Array of your asset comments.",
            content: {
                "application/json": {
                    schema: getAssetCommentsResponseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

export const ViewAssetCommentsRoute = (handler: AppHandler) => {
    handler.openapi(getAssetCommentsRoute, async (ctx) => {
        const assetId = ctx.req.valid("param").id

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

        const comments = await drizzle.query.assetComments.findMany({
            where: (assetComments, { eq }) =>
                eq(assetComments.assetId, assetId),
            with: {
                assetCommentsLikes: true,
            },
        })

        return ctx.json(
            {
                success: true,
                comments,
            },
            200
        )
    })
}
