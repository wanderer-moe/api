import { auth } from "@/v2/lib/auth/lucia"
import { getConnection } from "@/v2/db/turso"

import { following, follower } from "@/v2/db/schema"
import { eq } from "drizzle-orm"

export async function unfollowUser(c: APIContext): Promise<Response> {
    const drizzle = getConnection(c.env).drizzle

    const authRequest = auth(c.env).handleRequest(c)
    const session = await authRequest.validate()

    if (!session || session.state === "idle") {
        if (session) {
            await auth(c.env).invalidateSession(session.sessionId)
            authRequest.setSession(null)
        }
        return c.json({ success: false, state: "invalid session" }, 200)
    }

    const formData = await c.req.formData()

    const userToUnFollow = formData.get("userIdToUnFollow") as string | null

    if (!userToUnFollow) {
        return c.json({ success: false, state: "no userid entered" }, 200)
    }

    // check if user exists
    const user = await drizzle.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, userToUnFollow),
    })

    if (!user) {
        return c.json({ success: false, state: "user not found" }, 200)
    }

    if (user.id === session.user.userId) {
        return c.json(
            { success: false, state: "cannot unfollow yourself" },
            200
        )
    }

    const isFollowing = await drizzle.query.following.findFirst({
        where: (following, { eq }) =>
            eq(following.id, `${session.user.userId}-${userToUnFollow}`),
    })

    if (!isFollowing) {
        return c.json({ success: false, state: "not following" }, 200)
    }

    await drizzle.transaction(async (transaction) => {
        await transaction
            .delete(follower)
            .where(eq(follower.id, `${session.user.userId}-${userToUnFollow}`))
            .execute()

        await transaction
            .delete(following)
            .where(eq(following.id, `${session.user.userId}-${userToUnFollow}`))
            .execute()

        return c.json({ success: true, state: "unfollowed user" }, 200)
    })

    return c.json({ success: false, state: "failed to unfollow user" }, 200)
}
