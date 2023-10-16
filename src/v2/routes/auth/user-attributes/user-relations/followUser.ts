import { auth } from "@/v2/lib/auth/lucia"
import { getConnection } from "@/v2/db/turso"
import { z } from "zod"
import { following, follower } from "@/v2/db/schema"

const FollowUserSchema = z.object({
    userIdToFollow: z.string({
        required_error: "User ID is required",
        invalid_type_error: "User ID must be a string",
    }),
})

export async function followUser(c: APIContext): Promise<Response> {
    const formData = FollowUserSchema.safeParse(
        await c.req.formData().then((formData) => {
            const data = Object.fromEntries(formData.entries())
            return data
        })
    )

    if (!formData.success) {
        return c.json({ success: false, state: "invalid data" }, 400)
    }

    const { userIdToFollow: userToFollow } = formData.data

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

    // check if user exists
    const user = await drizzle.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, userToFollow),
    })

    if (!user) {
        return c.json({ success: false, state: "user not found" }, 200)
    }

    if (user.id === session.user.userId) {
        return c.json({ success: false, state: "cannot follow yourself" }, 200)
    }

    const isFollowing = await drizzle.query.following.findFirst({
        where: (following, { eq }) =>
            eq(following.id, `${session.user.userId}-${userToFollow}`),
    })

    if (isFollowing) {
        return c.json({ success: false, state: "already following" }, 200)
    }

    await drizzle.transaction(async (transaction) => {
        await transaction
            .insert(follower)
            .values({
                id: `${session.user.userId}-${userToFollow}`,
                followerUserId: session.user.userId,
                followingUserId: userToFollow,
            })
            .execute()

        await transaction
            .insert(following)
            .values({
                id: `${userToFollow}-${session.user.userId}`,
                followerUserId: userToFollow,
                followingUserId: session.user.userId,
            })
            .execute()

        return c.json({ success: true, state: "followed user" }, 200)
    })

    return c.json({ success: false, state: "failed to follow user" }, 500)
}
