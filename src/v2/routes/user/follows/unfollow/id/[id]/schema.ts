import { z } from "@hono/zod-openapi"

export const unfollowUserByIdSchema = z.object({
    id: z.string().openapi({
        param: {
            description: "The id of the user to unfollow.",
            in: "path",
            name: "id",
            required: true,
        },
    }),
})

export const unfollowUserByIdResponseSchema = z.object({
    success: z.literal(true),
})
