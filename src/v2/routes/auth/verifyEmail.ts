import { auth } from "@/v2/lib/auth/lucia"
import { getConnection } from "@/v2/db/turso"
import { emailVerificationToken, users } from "@/v2/db/schema"
import { eq } from "drizzle-orm"

export async function verifyEmail(c: APIContext): Promise<Response> {
    const authRequest = auth(c.env).handleRequest(c)

    const { token } = c.req.param()

    if (!token) {
        return c.json({ success: false, state: "invalid token entered" }, 200)
    }

    const drizzle = getConnection(c.env).drizzle
    const session = await authRequest.validate()

    const relatedUser = await drizzle
        .select()
        .from(emailVerificationToken)
        .where(eq(emailVerificationToken.token, token))

    if (!relatedUser) {
        return c.json({ success: false, state: "invalid token entered" }, 200)
    }

    if (session) {
        if (relatedUser[0].userId !== session.user.userId) {
            return c.json(
                { success: false, state: "invalid token entered" },
                200
            )
        }
    }

    await drizzle.transaction(async (trx) => {
        await trx
            .delete(emailVerificationToken)
            .where(eq(emailVerificationToken.token, token))
        await trx
            .update(users)
            .set({
                emailVerified: 1,
            })
            .where(eq(users.id, relatedUser[0].userId))
    })

    return c.json({ success: true, state: "email validated" }, 200)
}
