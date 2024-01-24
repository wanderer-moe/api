import { z } from "@hono/zod-openapi"
import { selectUserFollowingSchema, selectUserSchema } from "@/v2/db/schema"

export const viewUserfollowingbyIdSchema = z.object({
    id: z.string().openapi({
        param: {
            description: "User ID to view who they're following",
            in: "path",
            name: "id",
            required: true,
        },
    }),
})

export const viewUserFollowingOffsetSchema = z.object({
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

export const viewUserfollowingbyIdResponseSchema = z.object({
    success: z.literal(true),
    following: z.array(
        selectUserFollowingSchema.extend({
            following: selectUserSchema.pick({
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
