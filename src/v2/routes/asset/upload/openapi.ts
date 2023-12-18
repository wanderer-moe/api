import { createRoute } from "@hono/zod-openapi"
import { uploadAssetSchema } from "./schema"

export const uploadAssetRoute = createRoute({
    path: "/",
    method: "post",
    description: "Upload a new asset.",
    tags: ["Asset"],
    request: {
        body: {
            content: {
                "multipart/form-data": {
                    schema: uploadAssetSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Returns the new asset.",
        },
        400: {
            description: "Bad request.",
        },
        401: {
            description: "Unauthorized.",
        },
        500: {
            description: "Internal server error.",
        },
    },
})
