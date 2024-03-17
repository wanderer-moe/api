import { AppHandler } from "../handler"
import { getConnection } from "@/v2/db/turso"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"
import { assetCategory } from "@/v2/db/schema"
import { eq } from "drizzle-orm"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "@hono/zod-openapi"

export const deleteAssetCategorySchema = z.object({
    id: z.string().openapi({
        param: {
            name: "id",
            in: "path",
            description: "The ID of the category to delete.",
            example: "splash-art",
            required: true,
        },
    }),
})

export const deleteAssetCategoryResponseSchema = z.object({
    success: z.literal(true),
})

const deleteCategoryRoute = createRoute({
    path: "/{id}/delete",
    method: "delete",
    summary: "Delete a category",
    description: "Delete a category.",
    tags: ["Category"],
    request: {
        params: deleteAssetCategorySchema,
    },
    responses: {
        200: {
            description: "Returns boolean indicating success.",
            content: {
                "application/json": {
                    schema: deleteAssetCategoryResponseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

export const DeleteAssetCategoryRoute = (handler: AppHandler) => {
    handler.openapi(deleteCategoryRoute, async (ctx) => {
        const id = ctx.req.valid("param").id

        const { drizzle } = await getConnection(ctx.env)

        const [foundCategory] = await drizzle
            .select({ id: assetCategory.id })
            .from(assetCategory)
            .where(eq(assetCategory.id, id))

        if (!foundCategory) {
            return ctx.json(
                {
                    success: false,
                    message: "Category not found",
                },
                404
            )
        }

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

        await drizzle.delete(assetCategory).where(eq(assetCategory.id, id))

        return ctx.json(
            {
                success: true,
            },
            200
        )
    })
}
