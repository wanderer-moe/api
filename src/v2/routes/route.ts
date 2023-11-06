import { OpenAPIHono } from "@hono/zod-openapi"
import UserRoute from "@/v2/routes/user/route"
import { getConnection } from "@/v2/db/turso"
import { auth } from "@/v2/lib/auth/lucia"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.route("/user", UserRoute)

handler.use("*", async (ctx, next) => {
    const { drizzle, turso } = getConnection(ctx.env)
    const lucia = auth(ctx.env)

    ctx.set("drizzle", drizzle)
    ctx.set("turso", turso)
    ctx.set("lucia", lucia)

    await next()
})

export default handler
