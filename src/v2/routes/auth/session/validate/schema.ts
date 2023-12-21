import { z } from "@hono/zod-openapi"
import { selectUserSchema } from "@/v2/db/schema"

export const authValidationSchema = z.object({
    success: z.literal(true),
    user: selectUserSchema,
})
