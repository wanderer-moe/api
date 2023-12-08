import { OpenAPIHono } from "@hono/zod-openapi"
import { authAllCurrentSessions } from "./openapi"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(authAllCurrentSessions, async (ctx) => {
    const currentUser = ctx.get("user")

    return ctx.json(
        {
            success: true,
            currentUser: currentUser ? currentUser : null,
        },
        200
    )
})

export default handler
