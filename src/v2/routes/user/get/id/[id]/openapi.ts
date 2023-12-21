import { createRoute } from "@hono/zod-openapi"
import { getUserByIdSchema } from "./schema"
import { z } from "zod"
import { selectUserSchema } from "@/v2/db/schema"
import { GenericResponses } from "@/v2/lib/response-schemas"

const getUserByIdResponseSchema = z.object({
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

export const getUserByIdRoute = createRoute({
    path: "/{id}",
    method: "get",
    description: "Get a user by their ID.",
    tags: ["User"],
    request: {
        params: getUserByIdSchema,
    },
    responses: {
        200: {
            description: "The user was found.",
            content: {
                "application/json": {
                    schema: getUserByIdResponseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})
