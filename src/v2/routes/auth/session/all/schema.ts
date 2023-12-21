import { selectSessionSchema } from "@/v2/db/schema"
import { z } from "@hono/zod-openapi"

export const sessionListSchema = z.object({
    success: z.literal(true),
    currentSessions: selectSessionSchema
        .pick({
            id: true,
            expiresAt: true,
        })
        .array(),
})
