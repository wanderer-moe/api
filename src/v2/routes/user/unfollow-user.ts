import { AppHandler } from "../handler"
import { getConnection } from "@/v2/db/turso"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"
import { userFollowing, userBlocked } from "@/v2/db/schema"
import { and, eq, or } from "drizzle-orm"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "@hono/zod-openapi"

const unfollowUserByIdSchema = z.object({
    id: z.string().openapi({
        param: {
            description: "The id of the user to unfollow.",
            in: "path",
            name: "id",
            required: true,
        },
    }),
})

const unfollowUserByIdResponseSchema = z.object({
    success: z.literal(true),
})

const unFollowUserByIdRoute = createRoute({
    path: "/{id}/unfollow",
    method: "post",
    description: "Follow a user from their ID.",
    tags: ["User"],
    request: {
        params: unfollowUserByIdSchema,
    },
    responses: {
        200: {
            description: "True if the user was unfollowed.",
            content: {
                "application/json": {
                    schema: unfollowUserByIdResponseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

export const UnfollowUserRoute = (handler: AppHandler) => {
    handler.openapi(unFollowUserByIdRoute, async (ctx) => {
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
                    message: "You cannot unfollow yourself",
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

        if (!followStatus) {
            return ctx.json(
                {
                    success: false,
                    message: "You are not following this user",
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
            await drizzle
                .delete(userFollowing)
                .where(
                    and(
                        eq(userFollowing.followerId, user.id),
                        eq(userFollowing.followingId, userId)
                    )
                )
        } catch (e) {
            return ctx.json(
                {
                    success: false,
                    message: "Failed to unfollow user, does the user exist?",
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
}
