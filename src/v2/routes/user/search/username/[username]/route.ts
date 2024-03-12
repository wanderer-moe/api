import { OpenAPIHono } from "@hono/zod-openapi"
import { searchUsersByUsernameRoute } from "./openapi"
import { authUser } from "@/v2/db/schema"
import { or, like } from "drizzle-orm"
import { getConnection } from "@/v2/db/turso"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(searchUsersByUsernameRoute, async (ctx) => {
    const userQuery = ctx.req.valid("param").username

    const { drizzle } = await getConnection(ctx.env)

    const users = await drizzle
        .select({
            id: authUser.id,
            avatarUrl: authUser.avatarUrl,
            displayName: authUser.displayName,
            username: authUser.username,
            usernameColour: authUser.usernameColour,
            pronouns: authUser.pronouns,
            verified: authUser.verified,
            bio: authUser.bio,
            dateJoined: authUser.dateJoined,
            isSupporter: authUser.isSupporter,
            role: authUser.role,
        })
        .from(authUser)
        .where(or(like(authUser.username, `%${userQuery}%`)))
        .limit(25)

    return ctx.json({
        success: true,
        users,
    })
})

export default handler
