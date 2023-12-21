import { createRoute } from "@hono/zod-openapi"
import { assetSearchAllFilterSchema } from "./schema"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "zod"
import {
    selectAssetSchema,
    selectAssetTagAssetSchema,
    selectAssetTagSchema,
} from "@/v2/db/schema"

const assetSearchAllFilterResponseSchema = z.object({
    success: z.literal(true),
    // mmm nested schemas
    assets: z.array(
        selectAssetSchema.extend({
            assetTagAsset: z.array(
                selectAssetTagAssetSchema.extend({
                    assetTag: selectAssetTagSchema,
                })
            ),
        })
    ),
})

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
