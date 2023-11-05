import { auth } from "@/v2/lib/auth/lucia"
import { getConnection } from "@/v2/db/turso"
import { passwordResetToken, authUser } from "@/v2/db/schema"
import { eq } from "drizzle-orm"
import { generateRandomString } from "lucia/utils"
import { z } from "zod"
import {
    sendPasswordResetEmail,
    sendPasswordChangeEmail,
} from "@/v2/lib/resend/email"

const generatePasswordResetTokenSchema = z.object({
    email: z
        .string({
            required_error: "Email is required",
            invalid_type_error: "Email must be a string",
        })
        .email("Email must be a valid email address"),
})

export async function generatePasswordResetToken(
    c: APIContext
): Promise<Response> {
    const authRequest = auth(c.env).handleRequest(c)

    const formData = generatePasswordResetTokenSchema.safeParse(
        await c.req.formData().then((formData) => {
            const data = Object.fromEntries(formData.entries())
            return data
        })
    )

    if (!formData.success) {
        return c.json({ success: false, state: "invalid data" }, 400)
    }

    const { email } = formData.data

    const { drizzle } = getConnection(c.env)
    const session = await authRequest.validate()

    if (session) {
        return c.json({ success: false, state: "already logged in" }, 200)
    }

    const user = await drizzle
        .select()
        .from(authUser)
        .where(eq(authUser.email, email))

    if (!user) {
        return c.json({ success: false, state: "valid data" }, 200)
    }

    const token = generateRandomString(32)

    await drizzle.transaction(async (trx) => {
        await trx.insert(passwordResetToken).values({
            id: token,
            userId: user[0].id,
            token,
        })
    })

    await sendPasswordResetEmail(user[0].email, token, user[0].username, c)

    return c.json({ success: true, state: "valid data" }, 200)
}

const resetPasswordSchema = z
    .object({
        token: z.string({
            required_error: "Token is required",
            invalid_type_error: "Token must be a string",
        }),
        newPassword: z.string({
            required_error: "Password is required",
            invalid_type_error: "Password must be a string",
        }),
        newPasswordConfirm: z.string({
            required_error: "Password confirmation is required",
            invalid_type_error: "Password confirmation must be a string",
        }),
    })
    .refine((data) => data.newPassword === data.newPasswordConfirm, {
        message: "Passwords do not match",
        path: ["passwordConfirm"],
    })

export async function resetPassword(c: APIContext): Promise<Response> {
    const authRequest = auth(c.env).handleRequest(c)

    const formData = resetPasswordSchema.safeParse(
        await c.req.formData().then((formData) => {
            const data = Object.fromEntries(formData.entries())
            return data
        })
    )

    if (!formData.success) {
        return c.json({ success: false, state: "invalid data" }, 400)
    }

    const { token, newPassword } = formData.data

    const { drizzle } = getConnection(c.env)

    const session = await authRequest.validate()

    if (session) {
        return c.json({ success: false, state: "already logged in" }, 200)
    }

    const relatedUser = await drizzle
        .select()
        .from(passwordResetToken)
        .where(eq(passwordResetToken.token, token))

    if (!relatedUser) {
        return c.json({ success: false, state: "invalid token entered" }, 200)
    }

    if (new Date(relatedUser[0].expiresAt) < new Date()) {
        drizzle
            .delete(passwordResetToken)
            .where(eq(passwordResetToken.token, token))
        return c.json({ success: false, state: "invalid token entered" }, 200)
    }

    let user = await auth(c.env).getUser(relatedUser[0].userId)

    if (!user) {
        return c.json({ success: false, state: "invalid token entered" }, 200)
    }

    await auth(c.env).invalidateAllUserSessions(user.userId)
    await auth(c.env).updateKeyPassword("username", user.userId, newPassword)

    await drizzle
        .delete(passwordResetToken)
        .where(eq(passwordResetToken.token, token))

    if (user.emailVerified === 0) {
        user = await auth(c.env).updateUserAttributes(user.userId, {
            email_verified: 1,
        })
    }

    await sendPasswordChangeEmail(user.email, user.username, c)

    return c.json({ success: true, state: "updated credentials" }, 200)
}
