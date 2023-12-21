import { z } from "@hono/zod-openapi"
import { selectUserSchema } from "@/v2/db/schema"

export const getUserByNameSchema = z.object({
    username: z.string().openapi({
        param: {
            name: "username",
            in: "path",
            required: true,
            description: "The exact Username of the user to retrieve.",
        },
    }),
})

export const getUserByNameResponseSchema = z.object({
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
        isSupporter: true,
        roleFlags: true,
    }),
})
