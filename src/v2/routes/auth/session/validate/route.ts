import { OpenAPIHono } from "@hono/zod-openapi"
import { authValidationRoute } from "./openapi"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

// @ts-expect-error: this is going to complain lmfao - hacky workaround for now; there's probably a built in method for this somewhere? - read ./schema.ts
handler.openapi(authValidationRoute, async (ctx) => {
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

    return ctx.json(
        {
            success: true,
            user,
        },
        200
    )
})

export default handler
