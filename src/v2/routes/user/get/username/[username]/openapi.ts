import { createRoute } from "@hono/zod-openapi"
import { getUserByNameSchema } from "./schema"
import { z } from "zod"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { selectUserSchema } from "@/v2/db/schema"

const getUserByNameResponseSchema = z.object({
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

export const getUserByNameRoute = createRoute({
    path: "/{username}",
    method: "get",
    description: "Get a user by their exact username.",
    tags: ["User"],
    request: {
        params: getUserByNameSchema,
    },
    responses: {
        200: {
            description: "The user was found.",
            content: {
                "application/json": {
                    schema: getUserByNameResponseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})
