import { AppHandler } from "../handler"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"
import { getConnection } from "@/v2/db/turso"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "@hono/zod-openapi"
import { requestForm, selectRequestFormSchema } from "@/v2/db/schema"
import { eq } from "drizzle-orm"

export const viewRequestByIdSchema = z.object({
    id: z.string().openapi({
        param: {
            name: "id",
            in: "path",
            description: "The ID of the request to view.",
            example: "request_id",
            required: true,
        },
    }),
})

export const viewRequestByIdResponseSchema = z.object({
    success: z.literal(true),
    request: selectRequestFormSchema,
})

const viewRequestByIdRoute = createRoute({
    path: "/{id}",
    method: "get",
    summary: "View a request",
    description: "View a request by its ID. Supporter required.",
    tags: ["Requests"],
    request: {
        params: viewRequestByIdSchema,
    },
    responses: {
        200: {
            description: "The request was found and returned successfully.",
            content: {
                "application/json": {
                    schema: viewRequestByIdResponseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

export const ViewRequestRoute = (handler: AppHandler) => {
    handler.openapi(viewRequestByIdRoute, async (ctx) => {
        const requestId = ctx.req.valid("param").id

        const authSessionManager = new AuthSessionManager(ctx)

        const { user } = await authSessionManager.validateSession()

        if (!user || user.role != "creator" || user.plan == "supporter") {
            return ctx.json(
                {
                    success: false,
                    message: "Unauthorized. Only supporters can view requests.",
                },
                401
            )
        }

        const { drizzle } = await getConnection(ctx.env)

        const [request] = await drizzle
            .select()
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

        return ctx.json(
            {
                success: true,
                request: request,
            },
            200
        )
    })
}
