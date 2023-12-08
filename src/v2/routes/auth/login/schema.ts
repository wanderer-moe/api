import { z } from "@hono/zod-openapi"

export const loginSchema = z.object({
    email: z.string().min(3).max(32).openapi({
        description: "The email of the user.",
        example: "user@domain.com",
    }),
    password: z.string().min(8).max(64).openapi({
        description: "The password of the user.",
        example: "password1234",
    }),
    passwordConfirmation: z.string().min(8).max(64).openapi({
        description: "The password confirmation of the user.",
        example: "password1234",
    }),
})
