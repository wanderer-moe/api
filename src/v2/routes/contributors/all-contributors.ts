import { AppHandler } from "../handler"
import { getConnection } from "@/v2/db/turso"
import { authUser } from "@/v2/db/schema"
import { eq } from "drizzle-orm"
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
            displayName: true,
            usernameColour: true,
            plan: true,
            role: true,
        })
        .array(),
})

const contributorsRoute = createRoute({
    path: "/all",
    method: "get",
    summary: "Get all contributors",
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

export const AllContributorsRoute = (handler: AppHandler) => {
    handler.openapi(contributorsRoute, async (ctx) => {
        const { drizzle } = await getConnection(ctx.env)

        const contributors = await drizzle
            .select({
                id: authUser.id,
                username: authUser.username,
                avatarUrl: authUser.avatarUrl,
                displayName: authUser.displayName,
                usernameColour: authUser.usernameColour,
                plan: authUser.plan,
                role: authUser.role,
            })
            .from(authUser)
            .where(eq(authUser.isContributor, true))

        return ctx.json(
            {
                success: true,
                contributors,
            },
            200
        )
    })
}
