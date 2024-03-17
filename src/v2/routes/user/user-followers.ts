import { AppHandler } from "../handler"
import { getConnection } from "@/v2/db/turso"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "@hono/zod-openapi"
import { selectUserFollowingSchema, selectUserSchema } from "@/v2/db/schema"

const viewUserFollowsbyIdSchema = z.object({
    id: z.string().openapi({
        param: {
            description: "User ID to view who follows them",
            in: "path",
            name: "id",
            required: true,
        },
    }),
})

const viewUserFollowsbyIdOffsetSchema = z.object({
    offset: z
        .string()
        .optional()
        .openapi({
            param: {
                description: "The offset to start at, optional.",
                in: "query",
                name: "offset",
                required: false,
            },
        }),
})

export const viewUserFollowsbyIdResponseSchema = z.object({
    success: z.literal(true),
    followers: z.array(
        selectUserFollowingSchema.extend({
            follower: selectUserSchema.pick({
                id: true,
                avatarUrl: true,
                username: true,
                plan: true,
                verified: true,
                displayName: true,
            }),
        })
    ),
})

const viewUserFollowsByIdRoute = createRoute({
    path: "/{id}/followers",
    method: "get",
    summary: "View a user's followers",
    description: "View a user's followers from their ID.",
    tags: ["User"],
    request: {
        params: viewUserFollowsbyIdSchema,
        query: viewUserFollowsbyIdOffsetSchema,
    },
    responses: {
        200: {
            description:
                "List of a user's followers. Only 100 showed at a time, use pagination.",
            content: {
                "application/json": {
                    schema: viewUserFollowsbyIdResponseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

export const ViewUsersFollowersRoute = (handler: AppHandler) => {
    handler.openapi(viewUserFollowsByIdRoute, async (ctx) => {
        const { id } = ctx.req.valid("param")
        const { offset } = ctx.req.valid("query")

        const { drizzle } = await getConnection(ctx.env)

        const followers = await drizzle.query.userFollowing.findMany({
            where: (userFollowing, { eq }) => eq(userFollowing.followingId, id),
            with: {
                follower: {
                    columns: {
                        id: true,
                        avatarUrl: true,
                        username: true,
                        plan: true,
                        verified: true,
                        displayName: true,
                    },
                },
            },
            limit: 100,
            offset: offset ? parseInt(offset) : 0,
        })

        return ctx.json(
            {
                success: true,
                followers,
            },
            200
        )
    })
}
