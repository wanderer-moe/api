import { createRoute } from "@hono/zod-openapi"
import { selectSessionSchema } from "@/v2/db/schema"
import { z } from "zod"
import { GenericResponses } from "@/v2/lib/response-schemas"

const sessionListSchema = z.object({
    success: z.literal(true),
    currentSessions: selectSessionSchema
        .pick({
            id: true,
            expiresAt: true,
        })
        .array(),
})

export const authAllCurrentSessions = createRoute({
    path: "/",
    method: "get",
    description: "Get all current sessions.",
    tags: ["Auth"],
    responses: {
        200: {
            description: "All current sessions are returned",
            content: {
                "application/json": {
                    schema: sessionListSchema,
                },
            },
        },
        ...GenericResponses,
    },
})
