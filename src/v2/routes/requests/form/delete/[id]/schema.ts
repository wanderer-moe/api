import { z } from "@hono/zod-openapi"

export const deleteRequestByIdSchema = z.object({
    id: z.string().openapi({
        param: {
            name: "id",
            in: "path",
            description: "The ID of the request to delete.",
            example: "1",
            required: true,
        },
    }),
})

export const deleteRequestByIdResponseSchema = z.object({
    success: z.literal(true),
})
