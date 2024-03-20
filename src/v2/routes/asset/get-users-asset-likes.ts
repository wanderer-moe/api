import { getConnection } from "@/v2/db/turso"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "@hono/zod-openapi"
import {
    selectAssetSchema,
    selectAssetTagAssetSchema,
    selectAssetTagSchema,
    selectAssetLikesSchema,
} from "@/v2/db/schema"
import { AppHandler } from "../handler"

const responseSchema = z.object({
    success: z.literal(true),
    likes: z.array(
        selectAssetLikesSchema.extend({
            asset: selectAssetSchema.extend({
                assetTagAsset: z.array(
                    selectAssetTagAssetSchema.extend({
                        assetTag: selectAssetTagSchema,
                    })
                ),
            }),
        })
    ),
})

const openRoute = createRoute({
    path: "/likes",
    method: "get",
    summary: "Your liked assets",
    description: "List of all your liked assets.",
    tags: ["Asset"],
    responses: {
        200: {
            description: "Array of your liked assets.",
            content: {
                "application/json": {
                    schema: responseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

export const GetAssetLikesRoute = (handler: AppHandler) => {
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

        const { drizzle } = await getConnection(ctx.env)

        const likes = await drizzle.query.assetLikes.findMany({
            where: (assetLikes, { eq }) => eq(assetLikes.likedById, user.id),
            with: {
                asset: {
                    with: {
                        assetTagAsset: {
                            with: {
                                assetTag: true,
                            },
                        },
                    },
                },
            },
            offset: 0,
        })

        return ctx.json(
            {
                success: true,
                likes,
            },
            200
        )
    })
}
