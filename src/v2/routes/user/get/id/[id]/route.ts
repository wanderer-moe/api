import { OpenAPIHono } from "@hono/zod-openapi"
import { getUserByIdRoute } from "./openapi"
import { getConnection } from "@/v2/db/turso"
import { eq } from "drizzle-orm"
import { authUser } from "@/v2/db/schema"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(getUserByIdRoute, async (ctx) => {
    const userId = ctx.req.valid("param").id

    const { drizzle } = await getConnection(ctx.env)

    const [user] = await drizzle
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
            plan: authUser.plan,
            role: authUser.role,
        })
        .from(authUser)
        .where(eq(authUser.id, userId))

    return ctx.json(
        {
            success: true,
            user,
        },
        200
    )
})

export default handler
