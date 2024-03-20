import { AppHandler } from "../handler"
import { eq } from "drizzle-orm"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"
import { getConnection } from "@/v2/db/turso"
import { assetCategory, selectAssetCategorySchema } from "@/v2/db/schema"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "@hono/zod-openapi"

const paramsSchema = z.object({
    id: z.string().openapi({
        param: {
            name: "id",
            description: "The id of the category to modify.",
            example: "splash-art",
            in: "path",
            required: true,
        },
    }),
})

const requestBodySchema = z.object({
    name: z.string().min(3).max(32).openapi({
        description: "The new name of the category.",
        example: "splash-art",
    }),
    formattedName: z.string().min(3).max(64).openapi({
        description: "The new formatted name of the category.",
        example: "Splash Art",
    }),
})

const responseSchema = z.object({
    success: z.literal(true),
    assetCategory: selectAssetCategorySchema,
})

const openRoute = createRoute({
    path: "/{id}/modify",
    method: "patch",
    summary: "Modify a category",
    description: "Modify an existing category.",
    tags: ["Category"],
    request: {
        params: paramsSchema,
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
            description: "Returns the new category attributes",
            content: {
                "application/json": {
                    schema: responseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

export const ModifyAssetCategoryRoute = (handler: AppHandler) => {
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
        const { id } = ctx.req.valid("param")

        const { drizzle } = getConnection(ctx.env)

        const [existingCategory] = await drizzle
            .select({ id: assetCategory.id })
            .from(assetCategory)
            .where(eq(assetCategory.id, id))

        if (!existingCategory) {
            return ctx.json(
                {
                    success: false,
                    message: "Category not found",
                },
                404
            )
        }

        const [updatedCategory] = await drizzle
            .update(assetCategory)
            .set({
                name,
                formattedName,
                lastUpdated: new Date().toISOString(),
            })
            .where(eq(assetCategory.id, id))
            .returning()

        return ctx.json(
            {
                success: true,
                assetCategory: updatedCategory,
            },
            200
        )
    })
}
