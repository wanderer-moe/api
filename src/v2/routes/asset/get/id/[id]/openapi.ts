import { createRoute } from "@hono/zod-openapi"
import { getAssetByIdSchema } from "./schema"

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
            description: "The asset was found.",
        },
        500: {
            description: "Internal server error.",
        },
    },
})
