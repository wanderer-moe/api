import { z } from "@hono/zod-openapi"

export const logoutResponseSchema = z.object({
    success: z.literal(true),
})
