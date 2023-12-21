import { OpenAPIHono } from "@hono/zod-openapi"
import { userCreateAccountRoute } from "./openapi"
import { UserAuthenticationManager } from "@/v2/lib/managers/auth/user-auth-manager"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(userCreateAccountRoute, async (ctx) => {
    const authSessionManager = new AuthSessionManager(ctx)

    const { user } = await authSessionManager.validateSession()

    if (user) {
        return ctx.json(
            {
                success: false,
                message: "Already logged in",
            },
            401
        )
    }

    const { email, password, username } = ctx.req.valid("json")

    const userAuthManager = new UserAuthenticationManager(ctx)

    const existingUser = false

    if (existingUser) {
        return ctx.json(
            {
                success: false,
                message: "User already exists with that email",
            },
            400
        )
    }

    const newLoginCookie = await userAuthManager.createAccount(
        {
            email,
            username,
        },
        password
    )

    if (!newLoginCookie) {
        return ctx.json(
            {
                success: false,
                message: "Failed to create account",
            },
            500
        )
    }

    ctx.header("Set-Cookie", newLoginCookie.serialize(), {
        append: true,
    })

    return ctx.json(
        {
            success: true,
        },
        200
    )
})

export default handler
