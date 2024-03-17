import { OpenAPIHono } from "@hono/zod-openapi"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"
import { RequestFormManager } from "@/v2/lib/managers/request-form/request-form-manager"
import { getConnection } from "@/v2/db/turso"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "@hono/zod-openapi"

export const deleteRequestByIdSchema = z.object({
    id: z.string().openapi({
        param: {
            name: "id",
            in: "path",
            description: "The ID of the request to delete.",
            example: "1",
            required: true,
        },
    }),
})

export const deleteRequestByIdResponseSchema = z.object({
    success: z.literal(true),
})

const deleteRequestByIdRoute = createRoute({
    path: "/{id}",
    method: "delete",
    description:
        "Delete a request by its ID. This will also delete all associated upvotes.",
    tags: ["Requests"],
    request: {
        params: deleteRequestByIdSchema,
    },
    responses: {
        200: {
            description: "True if the request was deleted successfully.",
            content: {
                "application/json": {
                    schema: deleteRequestByIdResponseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(deleteRequestByIdRoute, async (ctx) => {
    const requestId = ctx.req.valid("param").id

    const authSessionManager = new AuthSessionManager(ctx)

    const { user } = await authSessionManager.validateSession()

    if (!user || user.role != "creator" || user.plan == "supporter") {
        return ctx.json(
            {
                success: false,
                message: "Unauthorized. Only supporters can delete requests.",
            },
            401
        )
    }

    const { drizzle } = await getConnection(ctx.env)

    const requestFormManager = new RequestFormManager(drizzle)

    const request =
        await requestFormManager.doesRequestFormEntryExist(requestId)

    if (!request) {
        return ctx.json(
            {
                success: false,
                message: "Request by ID not found",
            },
            404
        )
    }

    if (request.userId != user.id) {
        return ctx.json(
            {
                success: false,
                message: "Unauthorized. You can only delete your own requests.",
            },
            401
        )
    }

    await requestFormManager.deleteRequestFormEntry(requestId)

    return ctx.json(
        {
            success: true,
        },
        200
    )
})

export default handler
