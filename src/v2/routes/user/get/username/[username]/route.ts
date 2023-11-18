import { OpenAPIHono } from "@hono/zod-openapi"
import { getUserByNameRoute } from "./openapi"
import { UserSearchManager } from "@/v2/lib/managers/user/user-search-manager"
import { getConnection } from "@/v2/db/turso"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(getUserByNameRoute, async (ctx) => {
    const userId = ctx.req.valid("param").username

    const { drizzle } = await getConnection(ctx.env)
    const search = new UserSearchManager(drizzle)
    const user = await search.getUserByUsername(userId)

    return ctx.jsonT(
        {
            success: true,
            user,
        },
        200
    )
})

export default handler
