import { z } from "@hono/zod-openapi"
import { selectUserSchema } from "@/v2/db/schema"

export const getUsersByNameSchema = z.object({
    username: z.string().openapi({
        param: {
            name: "username",
            in: "path",
            required: true,
            description: "The username of the user(s) to retrieve.",
        },
    }),
})

export const searchUsersByUsernameSchema = z.object({
    success: z.literal(true),
    users: selectUserSchema
        .pick({
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
            role: true,
        })
        .array(),
})
