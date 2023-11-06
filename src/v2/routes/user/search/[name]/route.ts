import { OpenAPIHono } from "@hono/zod-openapi"
import { getUserByNameRoute } from "./openapi"
import { UserSearchManager } from "@/v2/lib/managers/user/user-search-manager"

const handler = new OpenAPIHono<{ Bindings: Bindings, Variables: Variables }>()

handler.openapi(getUserByNameRoute, async (ctx) => {
    const userId = ctx.req.valid("param").username

    const drizzle = ctx.get("drizzle")

    const search = new UserSearchManager(drizzle)
    const user = await search.getUserByUsername(userId)

    return ctx.jsonT({
        user,
    })
})

export default handler