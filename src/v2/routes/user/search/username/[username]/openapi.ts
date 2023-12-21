import { createRoute } from "@hono/zod-openapi"
import { getUsersByNameSchema } from "./schema"
import { z } from "zod"
import { selectUserSchema } from "@/v2/db/schema"
import { GenericResponses } from "@/v2/lib/response-schemas"

const searchUsersByUsernameSchema = z.object({
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
            roleFlags: true,
        })
        .array(),
})

export const searchUsersByUsernameRoute = createRoute({
    path: "/{username}",
    method: "get",
    description: "Search for users by their username.",
    tags: ["User"],
    request: {
        params: getUsersByNameSchema,
    },
    responses: {
        200: {
            description: "User(s) were found.",
            content: {
                "application/json": {
                    schema: searchUsersByUsernameSchema,
                },
            },
        },
        ...GenericResponses,
    },
})
