import { OpenAPIHono } from "@hono/zod-openapi"
import { searchUsersByUsernameRoute } from "./openapi"
import { UserSearchManager } from "@/v2/lib/managers/user/user-search-manager"
import { getConnection } from "@/v2/db/turso"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(searchUsersByUsernameRoute, async (ctx) => {
    const userQuery = ctx.req.valid("param").username

    const { drizzle } = await getConnection(ctx.env)
    const search = new UserSearchManager(drizzle)
    const users = await search.getUsersByUsername(userQuery)

    return ctx.jsonT({
        users,
    })
})

export default handler
