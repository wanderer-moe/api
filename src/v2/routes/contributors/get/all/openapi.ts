import { createRoute } from "@hono/zod-openapi"
import { selectUserSchema } from "@/v2/db/schema"
import { z } from "zod"

const contributorListSchema = z.object({
    success: z.literal(true),
    contributors: selectUserSchema
        .pick({
            id: true,
            username: true,
            avatarUrl: true,
            isSupporter: true,
            role: true,
        })
        .array(),
})
export const contributorsRoute = createRoute({
    path: "/all",
    method: "get",
    description: "Get a list of all contributors.",
    tags: ["Contributors"],
    responses: {
        200: {
            description: "All Contributors.",
            content: {
                "application/json": {
                    schema: contributorListSchema,
                },
            },
        },
        500: {
            description: "Internal server error.",
        },
    },
})
