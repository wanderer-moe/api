import { OpenAPIHono } from "@hono/zod-openapi"
import { viewUserfollowingbyIdRoute } from "./openapi"
import { getConnection } from "@/v2/db/turso"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(viewUserfollowingbyIdRoute, async (ctx) => {
    const { id } = ctx.req.valid("param")
    const { offset } = ctx.req.valid("query")

    const { drizzle } = await getConnection(ctx.env)

    const following = await drizzle.query.userFollowing.findMany({
        where: (userFollowing, { eq }) => eq(userFollowing.followerId, id),
        with: {
            following: {
                columns: {
                    id: true,
                    avatarUrl: true,
                    username: true,
                    isSupporter: true,
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
            following,
        },
        200
    )
})

export default handler
