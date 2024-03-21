import { AppHandler } from "../handler"
import { getConnection } from "@/v2/db/turso"
import { assetCategory } from "@/v2/db/schema"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { createRoute } from "@hono/zod-openapi"
import { z } from "@hono/zod-openapi"
import { selectAssetCategorySchema } from "@/v2/db/schema"

const responseSchema = z.object({
    success: z.literal(true),
    categories: selectAssetCategorySchema.array(),
})

const openRoute = createRoute({
    path: "/all",
    method: "get",
    summary: "Get all categories",
    description: "Get all categories.",
    tags: ["Category"],
    responses: {
        200: {
            description: "All categories.",
            content: {
                "application/json": {
                    schema: responseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

export const AllCategoriesRoute = (handler: AppHandler) => {
    handler.openapi(openRoute, async (ctx) => {
        const { drizzle } = await getConnection(ctx.env)

        const assetCategories =
            (await drizzle.select().from(assetCategory)) ?? []

        return ctx.json(
            {
                success: true,
                categories: assetCategories,
            },
            200
        )
    })
}
