import { createRoute } from "@hono/zod-openapi"
import { getAssetByIdSchema, getAssetByIdResponseSchema } from "./schema"
import { GenericResponses } from "@/v2/lib/response-schemas"

export const getAssetByIdRoute = createRoute({
    path: "/{id}",
    method: "get",
    description: "Get an asset by their ID.",
    tags: ["Asset"],
    request: {
        params: getAssetByIdSchema,
    },
    responses: {
        200: {
            description: "The found asset & similar assets are returned.",
            content: {
                "application/json": {
                    schema: getAssetByIdResponseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})
