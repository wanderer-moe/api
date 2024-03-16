import { OpenAPIHono } from "@hono/zod-openapi"
import { viewUserFollowsByIdRoute } from "./openapi"
import { getConnection } from "@/v2/db/turso"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(viewUserFollowsByIdRoute, async (ctx) => {
    const { id } = ctx.req.valid("param")
    const { offset } = ctx.req.valid("query")

    const { drizzle } = await getConnection(ctx.env)

    const followers = await drizzle.query.userFollowing.findMany({
        where: (userFollowing, { eq }) => eq(userFollowing.followingId, id),
        with: {
            follower: {
                columns: {
                    id: true,
                    avatarUrl: true,
                    username: true,
                    plan: true,
                    verified: true,
                    displayName: true,
                },
            },
        },
        limit: 100,
        offset: offset ? parseInt(offset) : 0,
    })

    return ctx.json(
        {
            success: true,
            followers,
        },
        200
    )
})

export default handler
