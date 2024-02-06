import { OpenAPIHono } from "@hono/zod-openapi"
import { deleteRequestByIdRoute } from "./openapi"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"
import { RequestFormManager } from "@/v2/lib/managers/request-form/request-form-manager"
import { getConnection } from "@/v2/db/turso"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(deleteRequestByIdRoute, async (ctx) => {
    const requestId = ctx.req.valid("param").id

    const authSessionManager = new AuthSessionManager(ctx)

    const { user } = await authSessionManager.validateSession()

    if (!user || user.role != "creator" || !user.isSupporter) {
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
