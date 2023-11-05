import { auth } from "@/v2/lib/auth/lucia"
import { getConnection } from "@/v2/db/turso"
import { z } from "zod"
import { userNetworking } from "@/v2/db/schema"

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
    const user = await drizzle.query.authUser.findFirst({
        where: (authUser, { eq }) => eq(authUser.id, userToFollow),
    })

    if (!user) {
        return c.json({ success: false, state: "user not found" }, 200)
    }

    if (user.id === session.user.userId) {
        return c.json({ success: false, state: "cannot follow yourself" }, 200)
    }

    // check if user is already following

    const existingFollow = await drizzle.query.userNetworking.findFirst({
        where: (userNetworking, { and, eq }) =>
            and(
                eq(userNetworking.followerId, session.user.userId),
                eq(userNetworking.followingId, user.id)
            ),
    })

    if (existingFollow) {
        return c.json({ success: false, state: "already following user" }, 200)
    }

    try {
        await drizzle.insert(userNetworking).values({
            followerId: session.user.userId,
            followingId: user.id,
            createdAt: new Date().toISOString(),
        })
    } catch (e) {
        return c.json({ success: false, state: "failed to follow user" }, 200)
    }

    return c.json({ success: true, state: "followed" }, 200)
}
