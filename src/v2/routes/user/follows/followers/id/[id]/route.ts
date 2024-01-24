import { OpenAPIHono } from "@hono/zod-openapi"
import { viewUserFollowsByIdRoute } from "./openapi"
import { getConnection } from "@/v2/db/turso"
import { UserFollowManager } from "@/v2/lib/managers/user/user-follow-manager"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(viewUserFollowsByIdRoute, async (ctx) => {
    const { id } = ctx.req.valid("param")
    const { offset } = ctx.req.valid("query")

    const { drizzle } = await getConnection(ctx.env)

    const userFollowManager = new UserFollowManager(drizzle)

    const followers = await userFollowManager.getUserFollowers(
        id,
        parseInt(offset)
    )

    return ctx.json(
        {
            success: true,
            followers,
        },
        200
    )
})

export default handler
