import { createRoute } from "@hono/zod-openapi"
import { unlikeAssetByIdSchema, unlikeAssetByIdResponseSchema } from "./schema"
import { GenericResponses } from "@/v2/lib/response-schemas"

export const unlikeAssetByIdRoute = createRoute({
    path: "/{id}",
    method: "get",
    description: "Unlike an asset from their ID.",
    tags: ["Asset"],
    request: {
        params: unlikeAssetByIdSchema,
    },
    responses: {
        200: {
            description: "True if the asset was unliked.",
            content: {
                "application/json": {
                    schema: unlikeAssetByIdResponseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})
