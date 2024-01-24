import { OpenAPIHono } from "@hono/zod-openapi"
import { followUserByIdRoute } from "./openapi"
import { getConnection } from "@/v2/db/turso"
import { UserFollowManager } from "@/v2/lib/managers/user/user-follow-manager"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"

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

    const userFollowManager = new UserFollowManager(drizzle)

    const followStatus = await userFollowManager.checkFollowStatus(
        user.id,
        userId
    )

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
        await userFollowManager.followUser(user.id, userId)
    } catch (e) {
        return ctx.json(
            {
                success: false,
                message: "Failed to follow user, does the user exist?",
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
