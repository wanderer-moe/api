import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import {
    modifyAssetSchema,
    modifyAssetResponseSchema,
    modifyAssetPathSchema,
} from "./schema"

export const modifyAssetRoute = createRoute({
    path: "/{id}",
    method: "patch",
    description: "Modify an existing asset.",
    tags: ["Asset"],
    request: {
        params: modifyAssetPathSchema,
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
