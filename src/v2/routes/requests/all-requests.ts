import { AppHandler } from "../handler"
import { getConnection } from "@/v2/db/turso"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "@hono/zod-openapi"
import { selectRequestFormSchema } from "@/v2/db/schema"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"

const querySchema = z
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

const responseSchema = z.object({
    success: z.literal(true),
    requests: z.array(requestFormSchema),
})

const openRoute = createRoute({
    path: "/all",
    method: "get",
    summary: "Get all requests",
    description:
        "Get all requests & associated upvotes count. Supporter required.",
    tags: ["Requests"],
    request: {
        query: querySchema,
    },
    responses: {
        200: {
            description: "List of all submitted requests.",
            content: {
                "application/json": {
                    schema: responseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

export const AllRequestsRoute = (handler: AppHandler) => {
    handler.openapi(openRoute, async (ctx) => {
        const { offset } = ctx.req.valid("query") ?? { offset: "0" }

        const authSessionManager = new AuthSessionManager(ctx)

        const { user } = await authSessionManager.validateSession()

        if (!user || user.role != "creator" || user.plan == "supporter") {
            return ctx.json(
                {
                    success: false,
                    message: "Unauthorized. Only supporters can view requests.",
                },
                401
            )
        }

        const { drizzle } = await getConnection(ctx.env)

        const allRequests = await drizzle.query.requestForm.findMany({
            offset: parseInt(offset),
            limit: 50,
        })

        return ctx.json(
            {
                success: true,
                requests: allRequests,
            },
            200
        )
    })
}
