import { z } from "@hono/zod-openapi"

export const followUserByIdSchema = z.object({
    id: z.string().openapi({
        param: {
            description: "The id of the user to follow.",
            in: "path",
            name: "id",
            required: true,
        },
    }),
})

export const followUserByIdResponseSchema = z.object({
    success: z.literal(true),
})
