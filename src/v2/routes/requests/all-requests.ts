import { OpenAPIHono } from "@hono/zod-openapi"
import { RequestFormManager } from "@/v2/lib/managers/request-form/request-form-manager"
import { getConnection } from "@/v2/db/turso"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "@hono/zod-openapi"
import { selectRequestFormSchema } from "@/v2/db/schema"

const viewAllRequestsSchema = z
    .object({
        offset: z.string().openapi({
            param: {
                description:
                    "The offset of requests to return. This is used for pagination.",
                name: "offset",
                example: "0",
                in: "query",
                required: false,
            },
        }),
    })
    .partial()

const requestFormSchema = z.object({
    ...selectRequestFormSchema.shape,
    upvotesCount: z.number().optional(),
})

const viewAllRequestsResponseSchema = z.object({
    success: z.literal(true),
    requests: z.array(requestFormSchema),
})

const getAllRequestsRoute = createRoute({
    path: "/",
    method: "get",
    description:
        "Get all requests. This will also return all associated upvotes count.",
    tags: ["Requests"],
    request: {
        query: viewAllRequestsSchema,
    },
    responses: {
        200: {
            description: "List of all submitted requests.",
            content: {
                "application/json": {
                    schema: viewAllRequestsResponseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

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
