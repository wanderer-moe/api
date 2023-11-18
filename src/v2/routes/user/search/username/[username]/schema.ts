import { z } from "@hono/zod-openapi"

export const getUsersByNameSchema = z.object({
    username: z.string().openapi({
        param: {
            name: "username",
            in: "path",
            required: true,
        },
        description: "The username of the user(s) to retrieve.",
    }),
})
