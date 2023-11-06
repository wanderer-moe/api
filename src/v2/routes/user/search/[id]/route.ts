import { OpenAPIHono } from "@hono/zod-openapi"
import { getUserByIdRoute } from "./openapi"
import { UserSearchManager } from "@/v2/lib/managers/user/user-search-manager"

const handler = new OpenAPIHono<{ Bindings: Bindings, Variables: Variables }>()

handler.openapi(getUserByIdRoute, async (ctx) => {
    const userId = ctx.req.valid("param").id

    const drizzle = ctx.get("drizzle")

    const search = new UserSearchManager(drizzle)
    const user = await search.getUserById(userId)

    return ctx.jsonT({
        user,
    })
})

export default handler