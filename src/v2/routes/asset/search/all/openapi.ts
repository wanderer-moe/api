import { createRoute } from "@hono/zod-openapi"
import {
    assetSearchAllFilterSchema,
    assetSearchAllFilterResponseSchema,
} from "./schema"
import { GenericResponses } from "@/v2/lib/response-schemas"

export const assetSearchAllFilterRoute = createRoute({
    path: "/",
    method: "get",
    description: "Filter all assets",
    tags: ["Asset"],
    request: {
        query: assetSearchAllFilterSchema,
    },
    responses: {
        200: {
            description: "Found assets",
            content: {
                "application/json": {
                    schema: assetSearchAllFilterResponseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})
