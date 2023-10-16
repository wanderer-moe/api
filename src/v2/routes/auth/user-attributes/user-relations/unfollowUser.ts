import { auth } from "@/v2/lib/auth/lucia"
import { getConnection } from "@/v2/db/turso"
import { z } from "zod"
import { following, follower } from "@/v2/db/schema"
import { eq } from "drizzle-orm"

const UnfollowUserSchema = z.object({
    userIdToUnFollow: z.string({
        required_error: "User ID is required",
        invalid_type_error: "User ID must be a string",
    }),
})

export async function unfollowUser(c: APIContext): Promise<Response> {
    const formData = UnfollowUserSchema.safeParse(
        await c.req.formData().then((formData) => {
            const data = Object.fromEntries(formData.entries())
            return data
        })
    )
    if (!formData.success) {
        return c.json({ success: false, state: "invalid data" }, 400)
    }

    const { userIdToUnFollow: userToUnFollow } = formData.data

    const { drizzle } = getConnection(c.env)

    const authRequest = auth(c.env).handleRequest(c)
    const session = await authRequest.validate()

    if (!session || session.state === "idle") {
        if (session) {
            await auth(c.env).invalidateSession(session.sessionId)
            authRequest.setSession(null)
        }
        return c.json({ success: false, state: "invalid session" }, 200)
    }

    if (userToUnFollow === session.user.userId) {
        return c.json(
            { success: false, state: "cannot unfollow yourself" },
            200
        )
    }

    // check if user exists
    const user = await drizzle.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, userToUnFollow),
    })

    if (!user) {
        return c.json({ success: false, state: "user not found" }, 200)
    }

    const isFollowing = await drizzle.query.following.findFirst({
        where: (following, { eq }) =>
            eq(following.id, `${session.user.userId}-${userToUnFollow}`),
    })

    if (!isFollowing) {
        return c.json({ success: false, state: "not following" }, 200)
    }

    await drizzle.transaction(async (trx) => {
        await trx
            .delete(follower)
            .where(eq(follower.id, `${session.user.userId}-${userToUnFollow}`))
            .execute()

        await trx
            .delete(following)
            .where(eq(following.id, `${session.user.userId}-${userToUnFollow}`))
            .execute()
        return c.json({ success: true, state: "unfollowed user" }, 200)
    })

    return c.json({ success: false, state: "failed to unfollow user" }, 200)
}
