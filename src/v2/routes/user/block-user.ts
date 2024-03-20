import { AppHandler } from "../handler"
import { getConnection } from "@/v2/db/turso"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"
import { and, eq, or } from "drizzle-orm"
import { userBlocked, userFollowing } from "@/v2/db/schema"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "@hono/zod-openapi"

const paramsSchema = z.object({
    id: z.string().openapi({
        param: {
            description: "The id of the user to block.",
            in: "path",
            name: "id",
            required: true,
        },
    }),
})

const responseSchema = z.object({
    success: z.literal(true),
})

const openRoute = createRoute({
    path: "/{id}/block",
    method: "post",
    summary: "Block a user",
    description: "Block a user from their ID.",
    tags: ["User"],
    request: {
        params: paramsSchema,
    },
    responses: {
        200: {
            description: "True if the user was blocked.",
            content: {
                "application/json": {
                    schema: responseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

export const BlockUserRoute = (handler: AppHandler) => {
    handler.openapi(openRoute, async (ctx) => {
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
                    message: "You cannot block yourself",
                },
                400
            )
        }

        const [blockedStatus] = await drizzle
            .select({
                id: userBlocked.blockedId,
                blockedById: userBlocked.blockedById,
            })
            .from(userBlocked)
            .where(eq(userBlocked.blockedId, userId))

        if (blockedStatus) {
            return ctx.json(
                {
                    success: false,
                    message: "User already blocked",
                },
                400
            )
        }

        await drizzle
            .delete(userFollowing)
            .where(
                or(
                    and(
                        eq(userFollowing.followerId, user.id),
                        eq(userFollowing.followingId, userId)
                    ),
                    and(
                        eq(userFollowing.followerId, userId),
                        eq(userFollowing.followingId, user.id)
                    )
                )
            )

        await drizzle
            .insert(userBlocked)
            .values({
                blockedId: userId,
                blockedById: user.id,
            })
            .execute()

        return ctx.json(
            {
                success: true,
            },
            200
        )
    })
}
