import { z } from "@hono/zod-openapi"
import { selectUserSchema } from "@/v2/db/schema"

export const getUserByIdSchema = z.object({
    id: z.string().openapi({
        param: {
            name: "id",
            in: "path",
            required: true,
            description: "The ID of the user to retrieve.",
        },
    }),
})

export const getUserByIdResponseSchema = z.object({
    success: z.literal(true),
    user: selectUserSchema.pick({
        id: true,
        avatarUrl: true,
        displayName: true,
        username: true,
        usernameColour: true,
        pronouns: true,
        verified: true,
        bio: true,
        dateJoined: true,
        plan: true,
        role: true,
    }),
})
