import { createRoute } from "@hono/zod-openapi"
import { assetSearchAllFilterSchema } from "./schema"

export const assetSearchAllFilterRoute = createRoute({
    path: "/",
    method: "get",
    description: "Filter all assets.",
    tags: ["Asset"],
    request: {
        query: assetSearchAllFilterSchema,
    },
    responses: {
        200: {
            description: "The asset was found.",
        },
        500: {
            description: "Internal server error.",
        },
    },
})
