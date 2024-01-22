import { createRoute } from "@hono/zod-openapi"
import { unlikeAssetByIdSchema, unlikeAssetByIdResponseSchema } from "./schema"
import { GenericResponses } from "@/v2/lib/response-schemas"

export const unlikeAssetByIdRoute = createRoute({
    path: "/",
    method: "post",
    description: "Unlike an asset from their ID.",
    tags: ["Asset"],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: unlikeAssetByIdSchema,
                },
            },
        },
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
