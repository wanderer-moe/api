import { OpenAPIHono } from "@hono/zod-openapi"
import { followUserByIdRoute } from "./openapi"
import { getConnection } from "@/v2/db/turso"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"
import { and, eq } from "drizzle-orm"
import { userFollowing } from "@/v2/db/schema"

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
