import { AppHandler } from "../handler"
import { assetTag } from "@/v2/db/schema"
import { eq } from "drizzle-orm"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"
import { getConnection } from "@/v2/db/turso"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "@hono/zod-openapi"
import { selectAssetTagSchema } from "@/v2/db/schema"

export const createTagSchema = z.object({
    name: z.string().min(3).max(32).openapi({
        description: "The name of the tag.",
        example: "official",
    }),
    formattedName: z.string().min(3).max(64).openapi({
        description: "The formatted name of the tag.",
        example: "Official",
    }),
})

export const createTagResponse = z.object({
    success: z.literal(true),
    tag: selectAssetTagSchema,
})

const createTagRoute = createRoute({
    path: "/create",
    method: "post",
    summary: "Create a tag",
    description: "Create a new tag.",
    tags: ["Tags"],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: createTagSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Returns the new tag.",
            content: {
                "application/json": {
                    schema: createTagResponse,
                },
            },
        },
        ...GenericResponses,
    },
})

export const CreateTagRoute = (handler: AppHandler) => {
    handler.openapi(createTagRoute, async (ctx) => {
        const authSessionManager = new AuthSessionManager(ctx)

        const { user } = await authSessionManager.validateSession()

        if (!user || user.role != "creator") {
            return ctx.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                401
            )
        }

        const { name, formattedName } = ctx.req.valid("json")

        const { drizzle } = getConnection(ctx.env)

        const [tagExists] = await drizzle
            .select({ name: assetTag.name })
            .from(assetTag)
            .where(eq(assetTag.name, name))

        if (tagExists) {
            return ctx.json(
                {
                    success: false,
                    message: "Tag already exists",
                },
                400
            )
        }

        const [newTag] = await drizzle
            .insert(assetTag)
            .values({
                id: name,
                name,
                formattedName,
                lastUpdated: new Date().toISOString(),
            })
            .returning()

        return ctx.json(
            {
                success: true,
                tag: newTag,
            },
            200
        )
    })
}
