import { OpenAPIHono } from "@hono/zod-openapi"
import { getConnection } from "@/v2/db/turso"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"
import { and, eq, or } from "drizzle-orm"
import { userFollowing, userBlocked } from "@/v2/db/schema"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "@hono/zod-openapi"

const followUserByIdSchema = z.object({
    id: z.string().openapi({
        param: {
            description: "The id of the user to follow.",
            in: "path",
            name: "id",
            required: true,
        },
    }),
})

const followUserByIdResponseSchema = z.object({
    success: z.literal(true),
})

export const followUserByIdRoute = createRoute({
    path: "/{id}",
    method: "post",
    description: "Follow a user from their ID.",
    tags: ["User"],
    request: {
        params: followUserByIdSchema,
    },
    responses: {
        200: {
            description: "True if the user was followed.",
            content: {
                "application/json": {
                    schema: followUserByIdResponseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(followUserByIdRoute, async (ctx) => {
    const userId = ctx.req.valid("param").id

    const { drizzle } = await getConnection(ctx.env)

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

    if (userId == user.id) {
        return ctx.json(
            {
                success: false,
                message: "You cannot follow yourself",
            },
            400
        )
    }
    const [followStatus] = await drizzle
        .select({ id: userFollowing.followerId })
        .from(userFollowing)
        .where(
            and(
                eq(userFollowing.followerId, user.id),
                eq(userFollowing.followingId, userId)
            )
        )
        .limit(1)

    if (followStatus) {
        return ctx.json(
            {
                success: false,
                message: "You are already following this user",
            },
            400
        )
    }

    const [blockedStatus] = await drizzle
        .select({
            id: userBlocked.blockedId,
            blockById: userBlocked.blockedById,
        })
        .from(userBlocked)
        .where(
            or(
                and(
                    eq(userBlocked.blockedId, user.id),
                    eq(userBlocked.blockedById, userId)
                ),
                and(
                    eq(userBlocked.blockedId, userId),
                    eq(userBlocked.blockedById, user.id)
                )
            )
        )
        .limit(1)

    if (blockedStatus) {
        const message =
            blockedStatus.blockById === user.id
                ? "You are blocked by this user"
                : "You have blocked this user"

        return ctx.json(
            {
                success: false,
                message,
            },
            400
        )
    }

    try {
        await drizzle.insert(userFollowing).values({
            followerId: user.id,
            followingId: userId,
            createdAt: new Date().toISOString(),
        })
    } catch (e) {
        return ctx.json(
            {
                success: false,
                message: "Failed to follow user.",
            },
            500
        )
    }

    return ctx.json(
        {
            success: true,
        },
        200
    )
})

export default handler
