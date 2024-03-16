import { OpenAPIHono } from "@hono/zod-openapi"
import { createRequestFormEntryRoute } from "./openapi"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"
import { RequestFormManager } from "@/v2/lib/managers/request-form/request-form-manager"
import { getConnection } from "@/v2/db/turso"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(createRequestFormEntryRoute, async (ctx) => {
    const { area, title, description } = ctx.req.valid("json")

    const authSessionManager = new AuthSessionManager(ctx)

    const { user } = await authSessionManager.validateSession()

    if (!user || user.role != "creator" || user.plan == "supporter") {
        return ctx.json(
            {
                success: false,
                message:
                    "Unauthorized. Only supporters can create request entries.",
            },
            401
        )
    }

    const { drizzle } = await getConnection(ctx.env)

    const requestFormManager = new RequestFormManager(drizzle)

    const [newRequestEntry] = await requestFormManager.createRequestFormEntry(
        user.id,
        title,
        area,
        description
    )

    return ctx.json(
        {
            success: true,
            response: newRequestEntry,
        },
        200
    )
})

export default handler
