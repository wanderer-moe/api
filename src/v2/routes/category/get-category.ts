import { AppHandler } from "../handler"
import { createRoute } from "@hono/zod-openapi"
import { assetCategory } from "@/v2/db/schema"
import { getConnection } from "@/v2/db/turso"
import { eq } from "drizzle-orm"
import { z } from "@hono/zod-openapi"
import { selectAssetCategorySchema } from "@/v2/db/schema"
import { GenericResponses } from "@/v2/lib/response-schemas"

const paramsSchema = z.object({
    id: z.string().openapi({
        param: {
            name: "id",
            in: "path",
            description: "The ID of the category to retrieve.",
            example: "splash-art",
            required: true,
        },
    }),
})

const responseSchema = z.object({
    success: z.literal(true),
    category: selectAssetCategorySchema,
})

const openRoute = createRoute({
    path: "/{id}",
    method: "get",
    summary: "Get a category",
    description: "Get a category by their ID.",
    tags: ["Category"],
    request: {
        params: paramsSchema,
    },
    responses: {
        200: {
            description: "Category was found.",
            content: {
                "application/json": {
                    schema: responseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

export const GetCategoryByIdRoute = (handler: AppHandler) => {
    handler.openapi(openRoute, async (ctx) => {
        const id = ctx.req.valid("param").id

        const { drizzle } = await getConnection(ctx.env)

        const [foundCategory] = await drizzle
            .select()
            .from(assetCategory)
            .where(eq(assetCategory.id, id))

        if (!foundCategory) {
            return ctx.json(
                {
                    success: false,
                    message: "Category not found",
                },
                400
            )
        }

        return ctx.json(
            {
                success: true,
                category: foundCategory,
            },
            200
        )
    })
}
