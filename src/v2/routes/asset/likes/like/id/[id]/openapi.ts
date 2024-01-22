import { createRoute } from "@hono/zod-openapi"
import { likeAssetByIdSchema, likeAssetByIdResponseSchema } from "./schema"
import { GenericResponses } from "@/v2/lib/response-schemas"

export const likeAssetByIdRoute = createRoute({
    path: "/{id}",
    method: "post",
    description: "Like an asset from their ID.",
    tags: ["Asset"],
    request: {
        params: likeAssetByIdSchema,
    },
    responses: {
        200: {
            description: "True if the asset was liked.",
            content: {
                "application/json": {
                    schema: likeAssetByIdResponseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})
