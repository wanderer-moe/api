import { AppHandler } from "../handler"
import { getConnection } from "@/v2/db/turso"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"
import { and, eq } from "drizzle-orm"
import { userBlocked } from "@/v2/db/schema"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "@hono/zod-openapi"

const unblockUserByIdSchema = z.object({
    id: z.string().openapi({
        param: {
            description: "The id of the user to unblock.",
            in: "path",
            name: "id",
            required: true,
        },
    }),
})

const unblockUserByIdResponseSchema = z.object({
    success: z.literal(true),
})

export const unblockUserByIdRoute = createRoute({
    path: "/{id}/block",
    method: "post",
    summary: "Unblock a user",
    description: "Unblock a user from their ID.",
    tags: ["User"],
    request: {
        params: unblockUserByIdSchema,
    },
    responses: {
        200: {
            description: "True if the user was unblocked.",
            content: {
                "application/json": {
                    schema: unblockUserByIdResponseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

export const UnblockUserRoute = (handler: AppHandler) => {
    handler.openapi(unblockUserByIdRoute, async (ctx) => {
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
                    message: "You cannot unblock yourself",
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
            .where(
                and(
                    eq(userBlocked.blockedId, userId),
                    eq(userBlocked.blockedById, user.id)
                )
            )

        if (!blockedStatus) {
            return ctx.json(
                {
                    success: false,
                    message: "You have not blocked this user",
                },
                400
            )
        }

        await drizzle
            .delete(userBlocked)
            .where(eq(userBlocked.id, blockedStatus.id))

        return ctx.json(
            {
                success: true,
            },
            200
        )
    })
}
