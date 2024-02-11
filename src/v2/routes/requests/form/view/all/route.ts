import { OpenAPIHono } from "@hono/zod-openapi"
import { getAllRequestsRoute } from "./openapi"
import { RequestFormManager } from "@/v2/lib/managers/request-form/request-form-manager"
import { getConnection } from "@/v2/db/turso"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(getAllRequestsRoute, async (ctx) => {
    const { offset } = ctx.req.valid("query") ?? { offset: "0" }

    const { drizzle } = await getConnection(ctx.env)

    const requestFormManager = new RequestFormManager(drizzle)

    const allRequests = await requestFormManager.getRequestFormEntries(
        parseInt(offset)
    )

    return ctx.json(
        {
            success: true,
            requests: allRequests,
        },
        200
    )
})

export default handler
