import { auth } from "@/v2/lib/auth/lucia"
import { getConnection } from "@/v2/db/turso"
import { APIContext as Context } from "@/worker-configuration"
import { following, follower } from "@/v2/db/schema"

export async function followUser(c: Context): Promise<Response> {
	const drizzle = getConnection(c.env).drizzle

	const authRequest = auth(c.env).handleRequest(c)
	const session = await authRequest.validate()

	if (!session || session.state === "idle" || session.state === "invalid") {
		if (session) {
			await auth(c.env).invalidateSession(session.sessionId)
			authRequest.setSession(null)
		}
		return c.json({ success: false, state: "invalid session" }, 200)
	}

	const formData = await c.req.formData()

	const userToFollow = formData.get("userIdToFollow") as string | null

	if (!userToFollow) {
		return c.json({ success: false, state: "no userid entered" }, 200)
	}

	// check if user exists
	const user = await drizzle.query.users.findFirst({
		where: (users, { eq }) => eq(users.id, userToFollow),
	})

	if (!user) {
		return c.json({ success: false, state: "user not found" }, 200)
	}

	const isFollowing = await drizzle.query.following.findFirst({
		where: (following, { eq }) =>
			eq(following.id, `${session.userId}-${userToFollow}`),
	})

	if (isFollowing) {
		return c.json({ success: false, state: "already following" }, 200)
	}

	await drizzle.transaction(async (transaction) => {
		const newFollower = await transaction
			.insert(follower)
			.values({
				id: `${session.userId}-${userToFollow}`,
				followerUserId: session.userId,
				followingUserId: userToFollow,
			})
			.execute()

		const newFollowing = await transaction
			.insert(following)
			.values({
				id: `${userToFollow}-${session.userId}`,
				followerUserId: userToFollow,
				followingUserId: session.userId,
			})
			.execute()
		return c.json(
			{ success: true, state: "ok", newFollowing, newFollower },
			200
		)
	})

	return c.json({ success: false, state: "failed to follow user" }, 500)
}
