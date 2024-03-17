import { AppHandler } from "../handler"
import { authUser } from "@/v2/db/schema"
import { or, like } from "drizzle-orm"
import { getConnection } from "@/v2/db/turso"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "@hono/zod-openapi"
import { selectUserSchema } from "@/v2/db/schema"

const getUsersByNameSchema = z.object({
    username: z.string().openapi({
        param: {
            name: "username",
            in: "path",
            required: true,
            description: "The username of the user(s) to retrieve.",
        },
    }),
})

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
            plan: true,
            role: true,
        })
        .array(),
})

const searchUsersByUsernameRoute = createRoute({
    path: "/search/{username}",
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

export const SearchUsersByUsernameRoute = (handler: AppHandler) => {
    handler.openapi(searchUsersByUsernameRoute, async (ctx) => {
        const userQuery = ctx.req.valid("param").username

        const { drizzle } = await getConnection(ctx.env)

        const users = await drizzle
            .select({
                id: authUser.id,
                avatarUrl: authUser.avatarUrl,
                displayName: authUser.displayName,
                username: authUser.username,
                usernameColour: authUser.usernameColour,
                pronouns: authUser.pronouns,
                verified: authUser.verified,
                bio: authUser.bio,
                dateJoined: authUser.dateJoined,
                plan: authUser.plan,
                role: authUser.role,
            })
            .from(authUser)
            .where(or(like(authUser.username, `%${userQuery}%`)))
            .limit(25)

        return ctx.json({
            success: true,
            users,
        })
    })
}
