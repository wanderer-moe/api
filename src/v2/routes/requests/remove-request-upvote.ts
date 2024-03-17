import { AppHandler } from "../handler"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"
import { getConnection } from "@/v2/db/turso"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "@hono/zod-openapi"
import { requestForm, requestFormUpvotes } from "@/v2/db/schema"
import { eq } from "drizzle-orm"

export const removeRequestUpvoteByIdSchema = z.object({
    id: z.string().openapi({
        param: {
            name: "id",
            in: "path",
            description: "The ID of the request to remove the upvote for.",
            example: "1",
            required: true,
        },
    }),
})

export const removeRequestUpvoteByIdResponseSchema = z.object({
    success: z.literal(true),
})

const removeRequestUpvoteByIdRoute = createRoute({
    path: "/{id}/downvote",
    method: "post",
    description: "Remove a upvote on a request by its ID. Supporter required.",
    tags: ["Requests"],
    request: {
        params: removeRequestUpvoteByIdSchema,
    },
    responses: {
        200: {
            description:
                "True if the request's upvote was removed successfully.",
            content: {
                "application/json": {
                    schema: removeRequestUpvoteByIdResponseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

export const RemoveRequestUpvoteRoute = (handler: AppHandler) => {
    handler.openapi(removeRequestUpvoteByIdRoute, async (ctx) => {
        const requestId = ctx.req.valid("param").id

        const authSessionManager = new AuthSessionManager(ctx)

        const { user } = await authSessionManager.validateSession()

        if (!user || user.role != "creator" || user.plan == "supporter") {
            return ctx.json(
                {
                    success: false,
                    message:
                        "Unauthorized. Only supporters can upvote requests.",
                },
                401
            )
        }

        const { drizzle } = await getConnection(ctx.env)

        const [request] = await drizzle
            .select({ id: requestForm.id, userId: requestForm.userId })
            .from(requestForm)
            .where(eq(requestForm.id, requestId))
            .limit(1)

        if (!request) {
            return ctx.json(
                {
                    success: false,
                    message: "Request by ID not found",
                },
                404
            )
        }

        if (request.userId == user.id) {
            return ctx.json(
                {
                    success: false,
                    message:
                        "Unauthorized. You can't remove upvotes on your own requests.",
                },
                401
            )
        }

        const [isUpvoted] = await drizzle
            .select({
                id: requestFormUpvotes.id,
            })
            .from(requestFormUpvotes)
            .where(eq(requestFormUpvotes.requestFormId, requestId))
            .limit(1)

        if (!isUpvoted) {
            return ctx.json(
                {
                    success: false,
                    message:
                        "Unauthorized. You can't remove upvotes on requests you haven't upvoted.",
                },
                401
            )
        }

        await drizzle
            .delete(requestFormUpvotes)
            .where(eq(requestFormUpvotes.requestFormId, requestId))

        return ctx.json(
            {
                success: true,
            },
            200
        )
    })
}
