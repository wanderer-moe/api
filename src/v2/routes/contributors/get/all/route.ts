import { OpenAPIHono } from "@hono/zod-openapi"
import { contributorsRoute } from "./openapi"
import { getConnection } from "@/v2/db/turso"
import { authUser } from "@/v2/db/schema"
import { eq } from "drizzle-orm"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(contributorsRoute, async (ctx) => {
    const { drizzle } = await getConnection(ctx.env)

    const contributors = await drizzle
        .select({
            id: authUser.id,
            username: authUser.username,
            avatarUrl: authUser.avatarUrl,
            isSupporter: authUser.isSupporter,
            roleFlags: authUser.roleFlags,
        })
        .from(authUser)
        .where(eq(authUser.isContributor, true))

    return ctx.json(
        {
            success: true,
            contributors,
        },
        200
    )
})

export default handler
