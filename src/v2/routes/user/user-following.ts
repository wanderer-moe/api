import { OpenAPIHono } from "@hono/zod-openapi"
import { getConnection } from "@/v2/db/turso"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "@hono/zod-openapi"
import { selectUserFollowingSchema, selectUserSchema } from "@/v2/db/schema"

const viewUserfollowingbyIdSchema = z.object({
    id: z.string().openapi({
        param: {
            description: "User ID to view who they're following",
            in: "path",
            name: "id",
            required: true,
        },
    }),
})

const viewUserFollowingOffsetSchema = z.object({
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

const viewUserfollowingbyIdResponseSchema = z.object({
    success: z.literal(true),
    following: z.array(
        selectUserFollowingSchema.extend({
            following: selectUserSchema.pick({
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

const viewUserfollowingbyIdRoute = createRoute({
    path: "/{id}",
    method: "get",
    description: "View who a user's following from their ID.",
    tags: ["User"],
    request: {
        params: viewUserfollowingbyIdSchema,
        query: viewUserFollowingOffsetSchema,
    },
    responses: {
        200: {
            description:
                "List of who a user's following. Only 100 showed at a time, use pagination.",
            content: {
                "application/json": {
                    schema: viewUserfollowingbyIdResponseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(viewUserfollowingbyIdRoute, async (ctx) => {
    const { id } = ctx.req.valid("param")
    const { offset } = ctx.req.valid("query")

    const { drizzle } = await getConnection(ctx.env)

    const following = await drizzle.query.userFollowing.findMany({
        where: (userFollowing, { eq }) => eq(userFollowing.followerId, id),
        with: {
            following: {
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
            following,
        },
        200
    )
})

export default handler