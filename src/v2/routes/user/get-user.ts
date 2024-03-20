import { AppHandler } from "../handler"
import { getConnection } from "@/v2/db/turso"
import { eq } from "drizzle-orm"
import { authUser } from "@/v2/db/schema"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "@hono/zod-openapi"
import { selectUserSchema } from "@/v2/db/schema"

const paramsSchema = z.object({
    id: z.string().openapi({
        param: {
            name: "id",
            in: "path",
            required: true,
            description: "The ID of the user to retrieve.",
        },
    }),
})

const responseSchema = z.object({
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
        plan: true,
        role: true,
    }),
})

const openRoute = createRoute({
    path: "/{id}",
    method: "get",
    summary: "Get a user",
    description: "Get a user by their ID.",
    tags: ["User"],
    request: {
        params: paramsSchema,
    },
    responses: {
        200: {
            description: "The user was found.",
            content: {
                "application/json": {
                    schema: responseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

export const GetUserByIdRoute = (handler: AppHandler) => {
    handler.openapi(openRoute, async (ctx) => {
        const userId = ctx.req.valid("param").id

        const { drizzle } = await getConnection(ctx.env)

        const [user] = await drizzle
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
            .where(eq(authUser.id, userId))

        return ctx.json(
            {
                success: true,
                user,
            },
            200
        )
    })
}
