import { AppHandler } from "../handler"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"
import { UserAuthenticationManager } from "@/v2/lib/managers/auth/user-auth-manager"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "@hono/zod-openapi"

const requestBodySchema = z.object({
    email: z.string().min(3).max(32).openapi({
        description: "The email of the user.",
        example: "user@domain.com",
    }),
    password: z.string().min(8).max(64).openapi({
        description: "The password of the user.",
        example: "password1234",
    }),
    passwordConfirmation: z.string().min(8).max(64).openapi({
        description: "The password confirmation of the user.",
        example: "password1234",
    }),
})

const responseSchema = z.object({
    success: z.literal(true),
})

const openRoute = createRoute({
    path: "/login",
    method: "post",
    summary: "Login",
    description: "Login to a user with an email and password.",
    tags: ["Auth"],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: requestBodySchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Returns true.",
            content: {
                "application/json": {
                    schema: responseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

export const UserLoginRoute = (handler: AppHandler) => {
    handler.openapi(openRoute, async (ctx) => {
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

        const { email, password } = ctx.req.valid("json")

        const userAuthManager = new UserAuthenticationManager(ctx)

        const newLoginCookie = await userAuthManager.loginViaPassword(
            email,
            password
        )

        if (!newLoginCookie) {
            return ctx.json(
                {
                    success: false,
                    message: "Invalid credentials",
                },
                401
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
}
