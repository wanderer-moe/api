import { z } from "@hono/zod-openapi"

export const getUserByNameSchema = z.object({
    username: z.string().openapi({
        param: {
            name: "username",
            in: "path",
            required: true,
        },
        description: "The Username of the user to retrieve.",
    }),
})
