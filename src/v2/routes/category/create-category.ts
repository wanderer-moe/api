import { AppHandler } from "../handler"
import { assetCategory } from "@/v2/db/schema"
import { eq } from "drizzle-orm"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"
import { getConnection } from "@/v2/db/turso"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "@hono/zod-openapi"
import { selectAssetCategorySchema } from "@/v2/db/schema"

const requestBodySchema = z.object({
    name: z.string().min(3).max(32).openapi({
        description: "The name of the asset category.",
        example: "splash-art",
    }),
    formattedName: z.string().min(3).max(64).openapi({
        description: "The formatted name of the category.",
        example: "Splash Art",
    }),
})

const responseSchema = z.object({
    success: z.literal(true),
    assetCategory: selectAssetCategorySchema,
})

const openRoute = createRoute({
    path: "/create",
    method: "post",
    summary: "Create a category",
    description: "Create a new category.",
    tags: ["Category"],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: requestBodySchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Returns the new category.",
            content: {
                "application/json": {
                    schema: responseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

export const CreateCategoryRoute = (handler: AppHandler) => {
    handler.openapi(openRoute, async (ctx) => {
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

        const [categoryExists] = await drizzle
            .select({ name: assetCategory.name })
            .from(assetCategory)
            .where(eq(assetCategory.name, name))

        if (categoryExists) {
            return ctx.json(
                {
                    success: false,
                    message: "Category already exists",
                },
                400
            )
        }

        const [newCategory] = await drizzle
            .insert(assetCategory)
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
                assetCategory: newCategory,
            },
            200
        )
    })
}
