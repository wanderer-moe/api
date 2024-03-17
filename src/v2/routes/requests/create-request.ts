import { OpenAPIHono } from "@hono/zod-openapi"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"
import { RequestFormManager } from "@/v2/lib/managers/request-form/request-form-manager"
import { getConnection } from "@/v2/db/turso"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "@hono/zod-openapi"
import { selectRequestFormSchema } from "@/v2/db/schema"
import type { requestArea } from "@/v2/db/schema"

const createRequestFormEntrySchema = z.object({
    title: z.string().min(3).max(32).openapi({
        description: "The title of the request.",
        example: "Add HSR UI assets",
    }),
    area: z
        .string()
        .min(3)
        .max(32)
        .openapi({
            description: "The area of the request.",
            example: "asset",
        })
        .transform((value) => value as requestArea),
    description: z.string().min(3).max(256).openapi({
        description: "The description of the request.",
        example:
            "Add the UI assets for Honkai: Star Rail, including the logo and other UI elements.",
    }),
})

const createRequestFormEntryResponse = z.object({
    success: z.literal(true),
    response: selectRequestFormSchema,
})

const createRequestFormEntryRoute = createRoute({
    path: "/",
    method: "post",
    description: "Create a new entry into the request form.",
    tags: ["Requests"],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: createRequestFormEntrySchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Returns the new request form entry.",
            content: {
                "application/json": {
                    schema: createRequestFormEntryResponse,
                },
            },
        },
        ...GenericResponses,
    },
})

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(createRequestFormEntryRoute, async (ctx) => {
    const { area, title, description } = ctx.req.valid("json")

    const authSessionManager = new AuthSessionManager(ctx)

    const { user } = await authSessionManager.validateSession()

    if (!user || user.role != "creator" || user.plan == "supporter") {
        return ctx.json(
            {
                success: false,
                message:
                    "Unauthorized. Only supporters can create request entries.",
            },
            401
        )
    }

    const { drizzle } = await getConnection(ctx.env)

    const requestFormManager = new RequestFormManager(drizzle)

    const [newRequestEntry] = await requestFormManager.createRequestFormEntry(
        user.id,
        title,
        area,
        description
    )

    return ctx.json(
        {
            success: true,
            response: newRequestEntry,
        },
        200
    )
})

export default handler
