import { AppHandler } from "../handler"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"
import { getConnection } from "@/v2/db/turso"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "@hono/zod-openapi"
import { requestForm, requestFormUpvotes } from "@/v2/db/schema"
import { eq } from "drizzle-orm"

export const upvoteRequestByIdSchema = z.object({
    id: z.string().openapi({
        param: {
            name: "id",
            in: "path",
            description: "The ID of the request to upvote.",
            example: "request_id",
            required: true,
        },
    }),
})

export const upvoteRequestByIdResponseSchema = z.object({
    success: z.literal(true),
})

const upvoteRequestByIdRoute = createRoute({
    path: "/{id}/upvote",
    method: "post",
    description: "Upvote a request by its ID. Supporter required.",
    tags: ["Requests"],
    request: {
        params: upvoteRequestByIdSchema,
    },
    responses: {
        200: {
            description: "True if the request was upvoted successfully.",
            content: {
                "application/json": {
                    schema: upvoteRequestByIdResponseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

export const UpvoteRequestRoute = (handler: AppHandler) => {
    handler.openapi(upvoteRequestByIdRoute, async (ctx) => {
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
                        "Unauthorized. You can't upvote your own requests.",
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

        if (isUpvoted) {
            return ctx.json(
                {
                    success: false,
                    message: "Request already upvoted",
                },
                400
            )
        }

        await drizzle.insert(requestFormUpvotes).values({
            requestFormId: requestId,
            userId: user.id,
        })

        return ctx.json(
            {
                success: true,
            },
            200
        )
    })
}
