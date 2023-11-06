import { OpenAPIHono } from "@hono/zod-openapi"
import UserSearchRoute from "@/v2/routes/user/search/route"
import { getConnection } from "@/v2/db/turso"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.route("/search", UserSearchRoute)

handler.use("*", async (ctx, next) => {
    const { drizzle, turso } = getConnection(ctx.env)

    ctx.set("drizzle", drizzle)
    ctx.set("turso", turso)

    await next()
})

export default handler
