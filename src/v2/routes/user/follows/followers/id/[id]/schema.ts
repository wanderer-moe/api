import { z } from "@hono/zod-openapi"
import { selectUserFollowingSchema, selectUserSchema } from "@/v2/db/schema"

export const viewUserFollowsbyIdSchema = z.object({
    id: z.string().openapi({
        param: {
            description: "User ID to view who follows them",
            in: "path",
            name: "id",
            required: true,
        },
    }),
})

export const viewUserFollowsbyIdOffsetSchema = z.object({
    offset: z
        .string()
        .optional()
        .openapi({
            param: {
                description: "The offset to start at, optional.",
                in: "query",
                name: "offset",
                required: false,
            },
        }),
})

export const viewUserFollowsbyIdResponseSchema = z.object({
    success: z.literal(true),
    followers: z.array(
        selectUserFollowingSchema.extend({
            follower: selectUserSchema.pick({
                id: true,
                avatarUrl: true,
                username: true,
                isSupporter: true,
                verified: true,
                displayName: true,
            }),
        })
    ),
})
