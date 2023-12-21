import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { modifyAssetSchema, modifyAssetResponseSchema } from "./schema"

export const modifyAssetRoute = createRoute({
    path: "/",
    method: "post",
    description: "Modify an existing asset.",
    tags: ["Asset"],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: modifyAssetSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Returns the asset's new attributes",
            content: {
                "application/json": {
                    schema: modifyAssetResponseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})
